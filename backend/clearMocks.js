const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = require('./models/Product');
  
  // Delete all products that have Unsplash images (these are the mock products)
  const result = await Product.deleteMany({ 'images': { $regex: /unsplash/i } });
  
  console.log(`Successfully deleted ${result.deletedCount} mock products from the database.`);
  
  const remaining = await Product.countDocuments();
  console.log(`Remaining products in database: ${remaining}`);
  
  process.exit(0);
});
