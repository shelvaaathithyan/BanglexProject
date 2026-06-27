const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const mockCategories = [
  { name: 'Glass Bangles', description: 'Traditional and designer glass bangles', status: 'Active' },
  { name: 'Jewellery Set', description: 'Handcrafted terracotta necklaces and earrings', status: 'Active' },
  { name: 'Jumkas', description: 'Beautiful handpainted temple jumkas', status: 'Active' },
  { name: 'Studs', description: 'Daily wear aesthetic clay studs', status: 'Active' },
  { name: 'Bridal Set', description: 'Grand heavy terracotta bridal jewellery', status: 'Active' },
  { name: 'Kids wear', description: 'Lightweight clay jewellery for children', status: 'Active' },
  { name: 'Combos', description: 'Mix and match bangle combos', status: 'Active' }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected for Seeding Categories');
    for (let cat of mockCategories) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
        console.log('Seeded category:', cat.name);
      }
    }
    console.log('Category seeding complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
