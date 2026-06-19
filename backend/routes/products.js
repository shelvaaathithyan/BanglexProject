const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// @route   GET /products
// @desc    Get all products or filter by category/limit
router.get('/', async (req, res) => {
  const { category, limit } = req.query;
  const filter = {};
  
  if (category) {
    // Normalise slug if the frontend passes one, or match directly.
    // We can do a case-insensitive check or direct string check.
    // If the category contains space, the query will have decoded space.
    filter.category = new RegExp(`^${category}$`, 'i');
  }

  try {
    let query = Product.find(filter);
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const products = await query.exec();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error fetching products' });
  }
});

// @route   GET /products/categories
// @desc    Get list of unique categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error fetching categories' });
  }
});

// @route   GET /products/:id
// @desc    Get single product by id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server Error fetching product details' });
  }
});

module.exports = router;
