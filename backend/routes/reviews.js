const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const ReviewService = require('../services/ReviewService');
const Order = require('../models/Order');

// Middleware to protect routes
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  protect(req, res, () => {
    if (req.user.email && req.user.email.toLowerCase() === 'banglexproject@gmail.com') {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  });
};

// GET /api/reviews/product/:productId/can-review
router.get('/product/:productId/can-review', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { orderId } = req.query; // Check specific order if provided

    // Find if user has a delivered order containing this product
    const orders = await Order.find({ user: userId, orderStatus: 'Delivered' }).populate('items.product');
    
    let eligibleOrderId = null;
    let alreadyReviewed = false;

    // Check all delivered orders for this user
    for (const order of orders) {
      if (orderId && order._id.toString() !== orderId) continue;
      
      const hasProduct = order.items.some(item => 
        (item.product && item.product._id && item.product._id.toString() === productId) || 
        (item.product && item.product.toString() === productId)
      );

      if (hasProduct) {
        // Check if reviewed THIS specific order
        const canReviewThisOrder = ReviewService.canReview(userId, productId, order._id.toString());
        if (canReviewThisOrder) {
          eligibleOrderId = order._id.toString();
          break; // Found an eligible order
        } else {
          alreadyReviewed = true; // They reviewed it, but maybe they bought it twice. Loop continues.
        }
      }
    }

    if (eligibleOrderId) {
      return res.json({ canReview: true, alreadyReviewed: false, orderId: eligibleOrderId, reason: "" });
    } else {
      return res.json({ 
        canReview: false, 
        alreadyReviewed, 
        orderId: null, 
        reason: alreadyReviewed ? "You have already reviewed this product for all your purchases." : "You can only review products from delivered orders." 
      });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/reviews
router.post('/', protect, async (req, res) => {
  try {
    const { productId, orderId, rating, title, review, customerName } = req.body;
    
    // Server-side validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating between 1 and 5 is required' });
    }

    if (!ReviewService.canReview(req.user.id, productId, orderId)) {
      return res.status(400).json({ message: 'Duplicate review for this order.' });
    }

    // Check order status
    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order || order.orderStatus !== 'Delivered') {
      return res.status(400).json({ message: 'Order is not delivered.' });
    }

    const newReview = ReviewService.addReview({
      productId,
      orderId,
      userId: req.user.id,
      customerName: customerName || `${req.user.firstName || 'Customer'}`,
      rating,
      title,
      review,
      verifiedPurchase: true
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// GET /api/reviews/product/:productId
router.get('/product/:productId', (req, res) => {
  try {
    const data = ReviewService.getProductReviews(req.params.productId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews/user/:userId
router.get('/user/:userId', protect, (req, res) => {
  try {
    if (req.user.id !== req.params.userId && req.user.email !== 'banglexproject@gmail.com') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const data = ReviewService.getUserReviews(req.params.userId);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- ADMIN ROUTES ---

// GET /api/reviews/admin
router.get('/admin', adminAuth, (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.productId) filters.productId = req.query.productId;
    const data = ReviewService.getAllReviews(filters);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/reviews/analytics
router.get('/analytics', adminAuth, (req, res) => {
  try {
    const stats = ReviewService.getAdminAnalytics();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/reviews/:id/status
router.patch('/:id/status', adminAuth, (req, res) => {
  try {
    const { status } = req.body; // Pending, Approved, Rejected, Hidden
    if (!['Pending', 'Approved', 'Rejected', 'Hidden'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const updated = ReviewService.updateReviewStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ message: 'Review not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', adminAuth, (req, res) => {
  try {
    const deleted = ReviewService.deleteReview(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review permanently deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update status
router.post('/bulk-status', adminAuth, (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    const updatedReviews = [];
    for (const id of ids) {
      const updated = ReviewService.updateReviewStatus(id, status);
      if (updated) updatedReviews.push(updated);
    }
    res.json({ message: `${updatedReviews.length} reviews updated successfully.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk delete
router.post('/bulk-delete', adminAuth, (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    let deletedCount = 0;
    for (const id of ids) {
      if (ReviewService.deleteReview(id)) {
        deletedCount++;
      }
    }
    res.json({ message: `${deletedCount} reviews permanently deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
