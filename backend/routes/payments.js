const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const { razorpay, verifySignature, verifyWebhookSignature } = require('../utils/razorpay');

// Helper to calculate amounts securely
const calculateAmounts = async (items, giftOptions = {}, deliveryOption = 'Standard') => {
  let subtotal = 0;
  for (const item of items) {
    const productId = item.product || item._id;
    const product = await Product.findById(productId);
    if (!product) throw new Error(`Product not found: ${productId}`);
    const priceToUse = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    subtotal += priceToUse * item.quantity;
  }
  
  const shipping = subtotal >= 999 ? 0 : (deliveryOption === 'Express' ? 150 : 0);
  const gst = subtotal * 0.05;
  const giftWrapFee = giftOptions.wrap ? 50 : 0;
  
  const grandTotal = subtotal + shipping + gst + giftWrapFee;
  return { subtotal, shipping, gst, grandTotal };
};

// Generate Order Number
const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  let nextSeq = '000001';
  if (lastOrder && lastOrder.orderNumber && lastOrder.orderNumber.startsWith(`ORD-${year}${month}`)) {
    const lastSeq = parseInt(lastOrder.orderNumber.slice(-6), 10);
    nextSeq = (lastSeq + 1).toString().padStart(6, '0');
  }
  return `ORD-${year}${month}${nextSeq}`;
};

// Generate Invoice Number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  let nextSeq = '000001';
  if (lastInvoice && lastInvoice.invoiceNumber && lastInvoice.invoiceNumber.startsWith(`INV-${year}`)) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split('-')[2], 10);
    nextSeq = (lastSeq + 1).toString().padStart(6, '0');
  }
  return `INV-${year}-${nextSeq}`;
};

// GET /api/payments/my-orders
router.get('/my-orders', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const orders = await Order.find({ user: decoded.id })
      .populate('items.product', 'name images price salePrice')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Fetch My Orders Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/payments/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { items, shippingAddress, contactInformation, giftOptions, orderNotes, deliveryOption, user } = req.body;
    
    // Verify we have a user (Assuming user ID is passed or from req.user auth middleware)
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const { subtotal, shipping, gst, grandTotal } = await calculateAmounts(items, giftOptions, deliveryOption);
    const orderNumber = await generateOrderNumber();

    // Create Razorpay Order
    const options = {
      amount: Math.round(grandTotal * 100), // Amount in paise
      currency: 'INR',
      receipt: orderNumber
    };
    
    if (process.env.PAYMENT_DEBUG === 'true') {
      console.log('--- [Razorpay] Order Creation Request ---');
      console.log('Endpoint: razorpay.orders.create');
      console.log('Request Body:', JSON.stringify(options, null, 2));
      console.log('Timestamp:', new Date().toISOString());
    }

    const rzpOrder = await razorpay.orders.create(options);

    if (process.env.PAYMENT_DEBUG === 'true') {
      console.log('--- [Razorpay] Order Creation Response ---');
      console.log('HTTP Status: 200 OK');
      console.log('Order ID:', rzpOrder.id);
      console.log('Amount:', rzpOrder.amount);
      console.log('Currency:', rzpOrder.currency);
      console.log('Status:', rzpOrder.status);
      console.log('Complete Response Body:', JSON.stringify(rzpOrder, null, 2));
    }

    // Map items to ensure product reference is set
    const orderItems = items.map(item => ({
      ...item,
      product: item.product || item._id
    }));

    // Create Pending Order in DB
    const newOrder = new Order({
      orderNumber,
      user,
      contactInformation,
      shippingAddress,
      items: orderItems,
      subtotal,
      shipping,
      gst,
      grandTotal,
      orderStatus: 'Pending Payment',
      paymentStatus: 'Pending',
      gatewayOrderId: rzpOrder.id,
      giftOptions,
      orderNotes,
      timeline: [{ status: 'Created', note: 'Order created, pending payment.' }]
    });

    await newOrder.save();

    res.json({
      success: true,
      order: newOrder,
      razorpayOrderId: rzpOrder.id,
      amount: options.amount,
      currency: options.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (process.env.PAYMENT_DEBUG === 'true') {
      console.log('--- [Razorpay] Signature Verification Request ---');
      console.log('Incoming Payload:', JSON.stringify(req.body, null, 2));
    }

    // Verify signature
    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (process.env.PAYMENT_DEBUG === 'true') {
      console.log('Verification Result:', isValid ? 'SUCCESS' : 'FAILED');
    }

    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new Error('Order not found');
    }

    if (!isValid) {
      // Signature failed, mark as failed but don't fail the API call entirely, just return error to frontend
      // The transaction will commit the failed status
      order.paymentStatus = 'Failed';
      order.timeline.push({ status: 'Payment Failed', note: 'Signature verification failed' });
      await order.save({ session });
      
      const failedPayment = new Payment({
        order: order._id,
        user: order.user,
        amount: order.grandTotal,
        gatewayOrderId: razorpay_order_id,
        gatewayPaymentId: razorpay_payment_id,
        gatewaySignature: razorpay_signature,
        status: 'Failed',
        paymentMethod: 'Unknown',
        failureReason: 'Signature Verification Failed'
      });
      await failedPayment.save({ session });
      
      await session.commitTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Signature valid! Complete the checkout workflow.
    
    // 1. Generate Invoice Number
    const invoiceNumber = await generateInvoiceNumber();

    // 2. Fetch payment details from Razorpay to get the actual method
    let actualPaymentMethod = 'Online';
    try {
      const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
      if (rzpPayment && rzpPayment.method) {
        const methodMap = {
          'upi': 'UPI',
          'card': 'Card',
          'netbanking': 'Netbanking',
          'wallet': 'Wallet',
          'emi': 'EMI',
          'paylater': 'Paylater'
        };
        actualPaymentMethod = methodMap[rzpPayment.method] || rzpPayment.method.charAt(0).toUpperCase() + rzpPayment.method.slice(1);
      }
    } catch (fetchErr) {
      console.error('Error fetching payment details from Razorpay:', fetchErr);
    }

    // 3. Create Payment Record
    const payment = new Payment({
      order: order._id,
      user: order.user,
      amount: order.grandTotal,
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
      status: 'Completed',
      paymentMethod: actualPaymentMethod,
      capturedAt: new Date()
    });
    await payment.save({ session });

    // 3. Create Invoice Record
    const invoice = new Invoice({
      invoiceNumber,
      order: order._id,
      payment: payment._id,
      customer: order.user,
      billingAddress: order.contactInformation, // Simplified
      items: order.items,
      subtotal: order.subtotal,
      shipping: order.shipping,
      gst: order.gst,
      grandTotal: order.grandTotal
    });
    await invoice.save({ session });

    // 4. Update Order
    order.orderStatus = 'Confirmed';
    order.paymentStatus = 'Completed';
    order.paymentDate = new Date();
    order.payment = payment._id;
    order.invoice = invoice._id;
    order.timeline.push({ status: 'Payment Completed', note: 'Payment successful.' });
    order.timeline.push({ status: 'Confirmed', note: 'Order confirmed and sent for processing.' });
    await order.save({ session });

    // 5. Reduce Inventory and generate notification
    let notificationMsg = `Order Details:\nOrder #: ${order.orderNumber}\nAmount: ₹${order.grandTotal}\n\nInventory Updates:\n`;
    for (const item of order.items) {
      const updatedProduct = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );
      if (updatedProduct) {
        notificationMsg += `${updatedProduct.name}: Decreased by ${item.quantity}.\nCurrent stock: ${updatedProduct.stock}\n`;
      }
    }
    
    // Create Notification for Admin
    const notification = new Notification({
      title: 'New Order!!',
      message: notificationMsg,
      type: 'ORDER'
    });
    await notification.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, orderId: order._id });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Verify Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments/retry
router.post('/retry', async (req, res) => {
  try {
    const { orderId } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus === 'Completed') return res.status(400).json({ message: 'Order already paid' });

    // Create a NEW Razorpay Order
    const options = {
      amount: Math.round(order.grandTotal * 100),
      currency: 'INR',
      receipt: order.orderNumber + '_retry_' + Date.now().toString().slice(-4)
    };
    
    const rzpOrder = await razorpay.orders.create(options);

    // Update the pending order with the new gateway ID
    order.gatewayOrderId = rzpOrder.id;
    await order.save();

    res.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: options.amount,
      currency: options.currency,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Retry Payment Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/payments/webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (process.env.PAYMENT_DEBUG === 'true') {
      console.log('--- [Razorpay] Webhook Event Received ---');
      console.log('Raw Payload:', req.body.toString());
      console.log('Signature:', signature);
    }
    
    // Validation
    const isValid = verifyWebhookSignature(req.body, signature, secret);
    
    if (process.env.PAYMENT_DEBUG === 'true') {
      console.log('Webhook Signature Verification Result:', isValid ? 'SUCCESS' : 'FAILED');
    }

    if (!isValid) return res.status(400).send('Invalid signature');

    const event = JSON.parse(req.body.toString());
    
    if (process.env.PAYMENT_DEBUG === 'true') {
      console.log('Webhook Event Name:', event.event);
    }
    
    // Idempotency check: Is this payment already recorded?
    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentId = event.payload.payment.entity.id;
      const existingPayment = await Payment.findOne({ gatewayPaymentId: paymentId });
      
      if (existingPayment && existingPayment.status === 'Completed') {
        return res.status(200).send('Already processed');
      }
      
      // If we reach here, it's a backup confirmation. In a full production system, 
      // you would perform the same transaction block as /verify here, looking up the order by gatewayOrderId.
    }
    
    // Acknowledge webhook
    res.status(200).send('Webhook processed');

  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook Error');
  }
});

// GET /api/payments/analytics - Get all ledger analytics (Renamed from /stats)
router.get('/analytics', async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const pipeline = await Payment.aggregate([
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalCount: { $sum: 1 },
                avgOrderValue: { $avg: '$amount' },
                maxTransaction: { $max: '$amount' },
                successfulCount: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
                failedCount: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
                refundedCount: { $sum: { $cond: [{ $eq: ['$status', 'Refunded'] }, 1, 0] } },
                totalRefundedAmount: { $sum: '$refundAmount' }
              }
            }
          ],
          todayCollection: [
            { $match: { createdAt: { $gte: startOfToday }, status: 'Completed' } },
            { $group: { _id: null, amount: { $sum: '$amount' } } }
          ],
          yesterdayCollection: [
            { $match: { createdAt: { $gte: startOfYesterday, $lt: startOfToday }, status: 'Completed' } },
            { $group: { _id: null, amount: { $sum: '$amount' } } }
          ],
          methods: [
            { $group: { _id: '$paymentMethod', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
            { $sort: { count: -1 } }
          ],
          recentFailed: [
            { $match: { status: 'Failed' } },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'userInfo'
              }
            },
            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } }
          ]
        }
      }
    ]);

    const data = pipeline[0];
    const totals = data.totals[0] || {
      totalAmount: 0, totalCount: 0, avgOrderValue: 0, maxTransaction: 0,
      successfulCount: 0, failedCount: 0, refundedCount: 0, totalRefundedAmount: 0
    };

    const todayAmount = data.todayCollection[0]?.amount || 0;
    const yesterdayAmount = data.yesterdayCollection[0]?.amount || 0;
    let todayGrowth = 0;
    if (yesterdayAmount > 0) {
      todayGrowth = ((todayAmount - yesterdayAmount) / yesterdayAmount) * 100;
    }

    const successRate = totals.totalCount > 0 ? (totals.successfulCount / totals.totalCount) * 100 : 0;
    const failureRate = totals.totalCount > 0 ? (totals.failedCount / totals.totalCount) * 100 : 0;
    const refundRate = totals.totalCount > 0 ? (totals.refundedCount / totals.totalCount) * 100 : 0;

    const mostUsedMethod = data.methods.length > 0 ? data.methods[0]._id : 'N/A';

    res.json({
      summary: {
        todayCollection: todayAmount,
        todayGrowth: todayGrowth.toFixed(1),
        successfulPayments: totals.successfulCount,
        successRate: successRate.toFixed(1),
        failedPayments: totals.failedCount,
        failureRate: failureRate.toFixed(1),
        totalRefunded: totals.totalRefundedAmount,
        refundCount: totals.refundedCount
      },
      insights: {
        highestTransaction: totals.maxTransaction || 0,
        averageOrderValue: totals.avgOrderValue || 0,
        mostUsedMethod,
        refundPercentage: refundRate.toFixed(1)
      },
      methodDistribution: data.methods.map(m => ({
        method: m._id,
        count: m.count,
        amount: m.amount,
        percentage: ((m.count / totals.totalCount) * 100).toFixed(1)
      })),
      recentFailed: data.recentFailed.map(f => ({
        id: f._id,
        customerName: f.userInfo ? `${f.userInfo.firstName || ''} ${f.userInfo.lastName || ''}`.trim() : 'Unknown',
        amount: f.amount,
        failureReason: f.failureReason || 'Payment Failed',
        createdAt: f.createdAt
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/payments - Paginated & Filtered
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status, 
      method, 
      gateway, 
      startDate, 
      endDate 
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (method) query.paymentMethod = method;
    if (gateway) query.gateway = gateway;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    let payments = await Payment.find(query)
      .populate('user', 'firstName lastName email mobileNumber')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });

    if (search) {
      const lowerSearch = search.toLowerCase();
      payments = payments.filter(p => {
        const orderMatch = p.order?.orderNumber?.toLowerCase().includes(lowerSearch);
        const nameMatch = p.user?.firstName?.toLowerCase().includes(lowerSearch) || p.user?.lastName?.toLowerCase().includes(lowerSearch);
        const emailMatch = p.user?.email?.toLowerCase().includes(lowerSearch);
        const idMatch = p.gatewayPaymentId?.toLowerCase().includes(lowerSearch) || p.gatewayOrderId?.toLowerCase().includes(lowerSearch);
        return orderMatch || nameMatch || emailMatch || idMatch;
      });
    }

    const total = payments.length;
    const paginatedPayments = payments.slice(skip, skip + limitNum);

    res.json({
      data: paginatedPayments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
