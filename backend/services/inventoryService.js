const mongoose = require('mongoose');
const Product = require('../models/Product');
const { getRedisClient } = require('../config/redis');

class InventoryService {
  
  static async getDashboardSummary() {
    const redis = getRedisClient();

    // 1. Get products from MongoDB
    const products = await Product.find().lean();
    
    let totalProducts = products.length;
    let totalStock = 0;
    
    // 2. Pipeline to get reserved stock for each product
    const multiP = redis.multi();
    for (const p of products) {
      totalStock += p.stock;
      multiP.get(`product:reserved:${p._id.toString()}`);
    }
    
    const reservedResults = await multiP.exec();
    
    let totalReserved = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let criticalCount = 0;
    let outOfStockCount = 0;
    
    products.forEach((p, index) => {
      let reservedForProduct = parseInt(reservedResults[index] || 0, 10);
      totalReserved += reservedForProduct;
      
      const available = p.stock - reservedForProduct;
      
      if (available > 10) inStockCount++;
      else if (available >= 4) lowStockCount++;
      else if (available > 0) criticalCount++;
      else outOfStockCount++;
    });

    const totalAvailable = Math.max(0, totalStock - totalReserved);

    // Get all active reservations from Redis (for Expiring Soon)
    const reservationKeys = await redis.keys('reservation:*');
    const expiringReservations = [];
    if (reservationKeys.length > 0) {
      const multiR = redis.multi();
      for (const k of reservationKeys) {
        multiR.hGetAll(k);
        multiR.pTTL(k);
      }
      const resvDetails = await multiR.exec();
      
      for (let i = 0; i < resvDetails.length; i += 2) {
        const data = resvDetails[i];
        const ttl = resvDetails[i + 1];
        if (ttl > 0 && ttl <= 5 * 60 * 1000) {
           const prod = products.find(p => p._id.toString() === data.productId);
           if (prod) {
             expiringReservations.push({
               ...data,
               product: { name: prod.name, images: prod.images },
               user: { name: 'User ' + data.userId.substring(0, 4) },
               expiresAt: new Date(Date.now() + ttl)
             });
           }
        }
      }
    }
    
    expiringReservations.sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));

    const recentMovementsRaw = await redis.lRange('inventory:recent-movements', 0, 2);
    const recentMovements = recentMovementsRaw.map(str => {
       const m = JSON.parse(str);
       return {
         ...m,
         createdAt: m.timestamp,
         product: { name: m.productName },
         performedBy: { name: 'System' },
         type: m.eventType
       };
    });

    const alerts = [];
    if (outOfStockCount > 0) {
      alerts.push({ type: 'error', message: `${outOfStockCount} products are out of stock.` });
    }
    if (criticalCount > 0) {
      alerts.push({ type: 'warning', message: `${criticalCount} products are critically low on stock.` });
    }
    if (expiringReservations.length > 0) {
      alerts.push({ type: 'info', message: `${expiringReservations.length} reservations are expiring soon.` });
    }

    return {
      summary: {
        totalProducts,
        totalStock,
        reservedStock: totalReserved,
        soldQuantity: 0, 
        availableStock: totalAvailable,
        lowStockItems: lowStockCount + criticalCount
      },
      stockHealth: {
        inStock: inStockCount,
        lowStock: lowStockCount,
        critical: criticalCount,
        outOfStock: outOfStockCount
      },
      expiringReservations,
      recentMovements,
      alerts
    };
  }

  static async getProducts(page = 1, limit = 10, search = '', sort = 'createdAt', order = -1) {
    const redis = getRedisClient();
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    
    const products = await Product.find(query)
      .sort({ [sort]: parseInt(order) })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
      
    const total = await Product.countDocuments(query);
    
    if (products.length > 0) {
       const multi = redis.multi();
       for (const p of products) {
         multi.get(`product:reserved:${p._id.toString()}`);
       }
       const reservedData = await multi.exec();
       products.forEach((p, idx) => {
          p.reservedQuantity = parseInt(reservedData[idx] || 0, 10);
          p.availableQuantity = p.stock - p.reservedQuantity;
          p.soldQuantity = 0;
       });
    }

    return {
      products,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    };
  }

  static async getProductMovements(productId) {
    return [];
  }

  static async adjustStock(productId, newStock, reason, adminId) {
    const redis = getRedisClient();
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const reservedCount = parseInt(await redis.get(`product:reserved:${product._id.toString()}`) || 0, 10);
    
    if (newStock < reservedCount) {
      throw new Error(`Cannot lower stock below active reservations (${reservedCount})`);
    }
    
    product.stock = newStock;
    await product.save();

    const movement = JSON.stringify({
      eventType: 'Admin Stock Adjustment',
      productName: product.name,
      productId: product._id.toString(),
      quantity: newStock,
      timestamp: new Date().toISOString()
    });
    
    const multi = redis.multi();
    multi.lPush('inventory:recent-movements', movement);
    multi.lTrim('inventory:recent-movements', 0, 2);
    await multi.exec();

    return { product, movement: { reason } };
  }
}

module.exports = InventoryService;
