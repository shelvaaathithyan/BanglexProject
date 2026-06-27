const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const bangles = ['Glass Bangles', 'Baby Shower', 'Antique Bangles', 'Combos', 'Plus Size Bangles'];
const terracotta = ['Daily wear', 'Jumkas', 'Studs', 'Jewellery Set', 'Bridal Set', 'Kids wear'];
const services = ['Organisers & Decors', 'Hampers'];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Category.updateMany({ name: { $in: bangles } }, { $set: { group: 'Bangles' } });
  await Category.updateMany({ name: { $in: terracotta } }, { $set: { group: 'Terracotta Jewellery' } });
  await Category.updateMany({ name: { $in: services } }, { $set: { group: 'Our Services' } });
  console.log('Updated category groups!');
  process.exit(0);
});
