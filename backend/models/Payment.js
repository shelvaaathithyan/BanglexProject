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
  gateway: {
    type: String,
    default: 'Razorpay'
  },
  gatewayOrderId: String,
  gatewayPaymentId: String,
  gatewaySignature: String,
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String, // E.g., 'UPI', 'Card', 'Net Banking', 'Wallet', 'COD'
    required: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  capturedAt: Date,
  failureReason: String,
  isRefunded: {
    type: Boolean,
    default: false
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed // Store raw webhook/API response for auditing
  },
  paymentAttempts: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
