const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'],
    default: 'Pending'
  },
  shippingAddress: {
    houseNo: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    price: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
