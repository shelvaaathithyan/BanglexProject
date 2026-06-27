const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = require('./models/Product');
  
  // Delete ALL products
  const result = await Product.deleteMany({});
  
  console.log(`Successfully deleted ${result.deletedCount} products from the database.`);
  console.log('The products database is now completely empty.');
  
  process.exit(0);
});
