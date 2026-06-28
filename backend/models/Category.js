const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: 'Active',
    enum: ['Active', 'Inactive']
  },
  group: {
    type: String,
    required: true,
    enum: ['Bangles', 'Terracotta Jewellery', 'Our Services'],
    default: 'Bangles'
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
