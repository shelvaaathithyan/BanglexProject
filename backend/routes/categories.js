const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// @route   GET /categories
// @desc    Get all categories with product counts
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().lean();
    
    // Get product counts for each category
    const categoryNames = categories.map(c => c.name);
    
    // Perform aggregation to get counts
    const productCounts = await Product.aggregate([
      { $match: { category: { $in: categoryNames } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const countMap = {};
    productCounts.forEach(pc => {
      countMap[pc._id] = pc.count;
    });

    const result = categories.map(cat => ({
      ...cat,
      products: countMap[cat.name] || 0
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

// @route   POST /categories
// @desc    Add a new category
router.post('/', async (req, res) => {
  try {
    const { name, description, status, group } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const newCat = new Category({ name, description, status, group });
    const savedCat = await newCat.save();
    
    res.status(201).json({ ...savedCat.toObject(), products: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while adding category' });
  }
});

// @route   PUT /categories/:id
// @desc    Update a category
router.put('/:id', async (req, res) => {
  try {
    const { name, description, status, group } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // If name changed, optionally update all products with old name
    // For simplicity, we just update the category here. If you want a robust system,
    // you would update `Product.updateMany({ category: category.name }, { category: name })`
    if (name && name !== category.name) {
      const existing = await Category.findOne({ name });
      if (existing) {
        return res.status(400).json({ message: 'A category with that name already exists' });
      }
      await Product.updateMany({ category: category.name }, { category: name });
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (status !== undefined) category.status = status;
    if (group !== undefined) category.group = group;

    await category.save();

    // fetch count to return updated object
    const count = await Product.countDocuments({ category: category.name });
    
    res.json({ ...category.toObject(), products: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while updating category' });
  }
});

// @route   DELETE /categories/:id
// @desc    Delete a category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
});

module.exports = router;
