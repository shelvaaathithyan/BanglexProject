const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  salePrice: {
    type: Number
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  images: [{
    type: String
  }],
  color: {
    type: String,
    trim: true
  },
  sizes: [{
    type: String,
    enum: ['2.2', '2.4', '2.6', '2.8']
  }],
  stock: {
    type: Number,
    default: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sku: {
    type: String,
    sparse: true,
    unique: true
  }
});

// Indexes for faster aggregation and search
ProductSchema.index({ category: 1 });
ProductSchema.index({ name: 1 });
ProductSchema.index({ sku: 1 });

module.exports = mongoose.model('Product', ProductSchema);
