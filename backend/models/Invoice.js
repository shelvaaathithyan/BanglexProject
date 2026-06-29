const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  billingAddress: {
    fullName: String,
    email: String,
    mobileNumber: String,
    houseNo: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  items: [{
    name: String,
    price: Number,
    quantity: Number,
    total: Number
  }],
  subtotal: Number,
  shipping: Number,
  gst: Number,
  grandTotal: Number,
  issuedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
