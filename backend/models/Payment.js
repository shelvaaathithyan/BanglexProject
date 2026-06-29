const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  method: {
    type: String,
    enum: ['UPI', 'Card', 'Net Banking', 'Wallet', 'COD'],
    required: true
  },
  gateway: {
    type: String,
    default: 'Razorpay'
  },
  gatewayOrderId: String,
  gatewayPaymentId: String,
  gatewaySignature: String,
  paymentCapturedAt: Date,
  paymentStatus: String, // E.g., 'captured', 'failed', 'authorized' from Razorpay
  
  failureReason: String,
  processingTimeMs: Number,
  refundAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
