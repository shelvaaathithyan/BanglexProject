require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Mongoose Connection Plugin
mongoose.plugin((schema) => {
  schema.add({ isTestData: { type: Boolean, default: false }, testRunId: { type: String } });
});

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
// Notification model might exist
let Notification;
try {
  Notification = require('../models/Notification');
} catch(e) {}

const { createClient } = require('redis');

async function clean() {
  await mongoose.connect(process.env.MONGODB_URI);
  const redis = createClient({ url: 'redis://127.0.0.1:6379' });
  await redis.connect();

  console.log('Starting cleanup...');

  // 1. Users
  const testUsers = await User.find({ 
    $or: [
      { isTestData: true }, 
      { email: /test.*@test\.com/i },
      { email: /load.*@test\.com/i }
    ] 
  });
  const userIds = testUsers.map(u => u._id);
  console.log(`Found ${userIds.length} test users to delete.`);

  // 2. Products
  const testProducts = await Product.find({
    $or: [
      { isTestData: true },
      { name: /^P[1-5]_/ },
      { name: 'DebugProduct' },
      { name: /Test Product/i }
    ]
  });
  const productIds = testProducts.map(p => p._id);
  console.log(`Found ${productIds.length} test products to delete.`);

  // 3. Orders
  const testOrders = await Order.find({
    $or: [
      { isTestData: true },
      { user: { $in: userIds } }
    ]
  });
  const orderIds = testOrders.map(o => o._id);
  console.log(`Found ${orderIds.length} test orders to delete.`);

  // 4. Payments
  const testPayments = await Payment.find({
    $or: [
      { isTestData: true },
      { order: { $in: orderIds } },
      { user: { $in: userIds } }
    ]
  });
  console.log(`Found ${testPayments.length} test payments to delete.`);

  // 5. Invoices
  const testInvoices = await Invoice.find({
    $or: [
      { isTestData: true },
      { order: { $in: orderIds } }
    ]
  });
  console.log(`Found ${testInvoices.length} test invoices to delete.`);

  // 6. Delete everything
  await User.deleteMany({ _id: { $in: userIds } });
  await Product.deleteMany({ _id: { $in: productIds } });
  await Order.deleteMany({ _id: { $in: orderIds } });
  await Payment.deleteMany({ _id: { $in: testPayments.map(p => p._id) } });
  await Invoice.deleteMany({ _id: { $in: testInvoices.map(i => i._id) } });

  if (Notification) {
    const testNotifs = await Notification.deleteMany({ user: { $in: userIds } });
    console.log(`Deleted ${testNotifs.deletedCount} notifications.`);
  }

  // 7. Redis
  const keys = await redis.keys('*');
  let redisDeleted = 0;
  for (const key of keys) {
    if (key.startsWith('product:reserved:') || key.startsWith('reservation:') || key.startsWith('product:reservations:')) {
      await redis.del(key);
      redisDeleted++;
    }
  }
  console.log(`Deleted ${redisDeleted} redis keys.`);

  console.log('Cleanup complete!');
  process.exit(0);
}

clean();
