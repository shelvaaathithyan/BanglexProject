require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const product = await Product.findOne({ name: 'Jelly Bangles' });
  console.log('Jelly Bangles Stock:', product.stock);
  
  const order = await Order.findOne({ "items.product": product._id }).sort({ createdAt: -1 });
  console.log('Latest Order for Jelly Bangles:');
  console.log('Order ID:', order._id);
  console.log('Order Status:', order.orderStatus);
  console.log('Payment Status:', order.paymentStatus);
  console.log('Reservation IDs:', order.reservationIds);
  console.log('Created At:', order.createdAt);
  
  process.exit(0);
}

run();
