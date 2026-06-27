const mongoose = require('mongoose');

const festivalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  discountType: { type: String, required: true },
  discountValue: { type: String, required: true },
  applyTo: { type: String, required: true }, // 'All Products', 'Specific Categories', 'Specific Products'
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  startDate: { type: String, required: true },
  startTime: { type: String, required: true },
  endDate: { type: String, required: true },
  endTime: { type: String, required: true },
  desktopBannerUrl: { type: String }, // Cloudinary URL
  mobileBannerUrl: { type: String }, // Cloudinary URL
  bannerText: { type: String },
  showBadge: { type: Boolean, default: true },
  showTimer: { type: Boolean, default: true },
  featureOnHome: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Festival', festivalSchema);
