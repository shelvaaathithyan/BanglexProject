require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Order = require('../models/Order');
  
  const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
  for (const o of orders) {
    console.log(`Order ${o.orderNumber} - Status: ${o.paymentStatus} - Reservation IDs:`, o.reservationIds);
  }
  process.exit(0);
}
check();
