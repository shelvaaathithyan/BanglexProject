const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const Product = require('./models/Product');
  
  // Products that do not have unsplash images (which is what seed uses)
  const userProducts = await Product.find({ 'images': { $not: /unsplash/i } });
  console.log('User Products:', userProducts.length);
  
  // Let's also print them to see if they are the 3-4 products
  userProducts.forEach(p => console.log(p.name, p.images));
  
  process.exit(0);
});
