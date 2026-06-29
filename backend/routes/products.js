const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });


// @route   GET /products
// @desc    Get all products or filter by category/limit
router.get('/', async (req, res) => {
  const { category, limit } = req.query;
  const filter = {};
  
  if (category) {
    // Normalise slug if the frontend passes one, or match directly.
    // We can do a case-insensitive check or direct string check.
    // If the category contains space, the query will have decoded space.
    filter.category = new RegExp(`^${category}$`, 'i');
  }

  try {
    let query = Product.find(filter).sort({ createdAt: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const products = await query.exec();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error fetching products' });
  }
});

// @route   POST /products
// @desc    Add a new product with image upload
const uploadMultiple = upload.array('images', 20);

router.post('/', (req, res, next) => {
  uploadMultiple(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Too many files selected. Max limit is 20 images.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: `File upload error: ${err.message || 'Unknown error'}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, description, category, price, stock, color, isPopular, sizes } = req.body;
    
    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }

    const newProductData = {
      name,
      description,
      category,
      price: Number(price),
      stock: stock ? Number(stock) : 10,
      color,
      sizes: sizes ? JSON.parse(sizes) : [],
      isPopular: isPopular === 'true',
      images: []
    };

    if (req.files && req.files.length > 0) {
      newProductData.images = req.files.map(file => file.path);
    }

    const newProduct = new Product(newProductData);
    const savedProduct = await newProduct.save();
    
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ message: 'Server error while adding product' });
  }
});

// @route   GET /products/categories
// @desc    Get list of unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error fetching categories' });
  }
});

// @route   GET /products/:id
// @desc    Get single product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server Error fetching product details' });
  }
});

// @route   PUT /products/:id
// @desc    Update a product
router.put('/:id', (req, res, next) => {
  uploadMultiple(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Too many files selected. Max limit is 20 images.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: `File upload error: ${err.message || 'Unknown error'}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, description, category, price, stock, color, isPopular, sizes } = req.body;
    
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (category) product.category = category;
    if (price) product.price = Number(price);
    if (stock !== undefined) {
      const newStock = Number(stock);
      const redis = require('../config/redis').getRedisClient();
      const reservedCount = parseInt(await redis.get(`product:reserved:${product._id.toString()}`) || 0, 10);
      
      if (newStock < reservedCount) {
        return res.status(400).json({ 
          message: `Cannot reduce stock because ${reservedCount} units are currently reserved by customers in active checkout sessions. Wait for reservations to expire.` 
        });
      }
      
      const oldStock = product.stock;
      const difference = newStock - oldStock;
      if (difference !== 0) {
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
      }
      product.stock = newStock;
    }
    if (color !== undefined) product.color = color;
    if (isPopular !== undefined) product.isPopular = isPopular === 'true';
    if (sizes !== undefined) product.sizes = JSON.parse(sizes);

    if (req.files && req.files.length > 0) {
      product.images = req.files.map(file => file.path);
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// @route   DELETE /products/:id
// @desc    Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (err) {
    console.error('Error deleting product:', err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

module.exports = router;
