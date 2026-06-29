const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// GET /api/payments/stats - Get all ledger analytics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    // 1. Core aggregations
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
            { $group: { _id: '$method', count: { $sum: 1 }, amount: { $sum: '$amount' } } },
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
    if (method) query.method = method;
    if (gateway) query.gateway = gateway;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Prepare sort and pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Initial populate query
    let payments = await Payment.find(query)
      .populate('user', 'firstName lastName email mobileNumber')
      .populate('order', 'orderNumber')
      .sort({ createdAt: -1 });

    // Handle search manually since it spans populated fields (can be optimized with aggregate in large DBs)
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
