const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Festival = require('../models/Festival');

// Configure multer storage specifically for banners
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'banners',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif', 'gif'],
  },
});
const upload = multer({ storage: bannerStorage });

// Create a new festival offer
router.post('/', upload.fields([{ name: 'desktopBanner', maxCount: 1 }, { name: 'mobileBanner', maxCount: 1 }]), async (req, res) => {
  try {
    const {
      name, description, discountType, discountValue, applyTo,
      categories, products, startDate, startTime, endDate, endTime,
      bannerText, showBadge, showTimer, featureOnHome, isActive
    } = req.body;

    // Parse arrays correctly if they come as strings
    let parsedCategories = [];
    let parsedProducts = [];
    
    if (categories) {
      try {
        parsedCategories = Array.isArray(categories) ? categories : JSON.parse(categories);
      } catch (e) {
        if (typeof categories === 'string' && categories.length > 0) parsedCategories = [categories];
      }
    }
    
    if (products) {
      try {
        parsedProducts = Array.isArray(products) ? products : JSON.parse(products);
      } catch (e) {
        if (typeof products === 'string' && products.length > 0) parsedProducts = [products];
      }
    }

    // Set all other festivals to inactive if this new one is active
    if (isActive === 'true' || isActive === true) {
      await Festival.updateMany({}, { isActive: false });
    }

    const festival = new Festival({
      name,
      description,
      discountType,
      discountValue,
      applyTo,
      categories: parsedCategories,
      products: parsedProducts,
      startDate,
      startTime,
      endDate,
      endTime,
      bannerText,
      showBadge: showBadge === 'true' || showBadge === true,
      showTimer: showTimer === 'true' || showTimer === true,
      featureOnHome: featureOnHome === 'true' || featureOnHome === true,
      isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true),
      desktopBannerUrl: req.files && req.files['desktopBanner'] ? req.files['desktopBanner'][0].path : '',
      mobileBannerUrl: req.files && req.files['mobileBanner'] ? req.files['mobileBanner'][0].path : ''
    });

    const savedFestival = await festival.save();
    res.status(201).json(savedFestival);
  } catch (error) {
    console.error('Error creating festival:', error);
    res.status(500).json({ message: 'Error creating festival offer' });
  }
});

// Get the currently active festival with populated categories and products
router.get('/active/populated', async (req, res) => {
  try {
    const activeFestival = await Festival.findOne({ isActive: true })
      .populate('categories')
      .populate('products');
    res.json(activeFestival || null);
  } catch (error) {
    console.error('Error fetching populated active festival:', error);
    res.status(500).json({ message: 'Error fetching active festival' });
  }
});

// Get the currently active festival
router.get('/active', async (req, res) => {
  try {
    const activeFestival = await Festival.findOne({ isActive: true });
    res.json(activeFestival || null);
  } catch (error) {
    console.error('Error fetching active festival:', error);
    res.status(500).json({ message: 'Error fetching active festival' });
  }
});

// Get all festivals
router.get('/', async (req, res) => {
  try {
    const festivals = await Festival.find().sort({ createdAt: -1 });
    res.json(festivals);
  } catch (error) {
    console.error('Error fetching all festivals:', error);
    res.status(500).json({ message: 'Error fetching festivals' });
  }
});

// Delete a festival
router.delete('/:id', async (req, res) => {
  try {
    const festival = await Festival.findById(req.params.id);
    if (!festival) {
      return res.status(404).json({ message: 'Festival not found' });
    }

    // Helper to extract public_id from Cloudinary URL
    const extractPublicId = (url) => {
      if (!url) return null;
      const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
      return matches ? matches[1] : null;
    };

    const desktopPublicId = extractPublicId(festival.desktopBannerUrl);
    if (desktopPublicId) {
      try {
        await cloudinary.uploader.destroy(desktopPublicId);
      } catch (err) {
        console.error('Error deleting desktop banner from cloudinary:', err);
      }
    }

    const mobilePublicId = extractPublicId(festival.mobileBannerUrl);
    if (mobilePublicId) {
      try {
        await cloudinary.uploader.destroy(mobilePublicId);
      } catch (err) {
        console.error('Error deleting mobile banner from cloudinary:', err);
      }
    }

    await Festival.findByIdAndDelete(req.params.id);
    res.json({ message: 'Festival deleted successfully' });
  } catch (error) {
    console.error('Error deleting festival:', error);
    res.status(500).json({ message: 'Error deleting festival' });
  }
});

module.exports = router;
