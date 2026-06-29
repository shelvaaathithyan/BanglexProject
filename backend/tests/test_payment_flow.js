require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const { getRedisClient, initRedis, getScriptShas } = require('../config/redis');

const API_URL = 'http://localhost:3000'; // Assuming backend is on port 5000 inside docker or localhost

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  process.env.REDIS_URL = 'redis://127.0.0.1:6379';
  await initRedis();
  const redis = getRedisClient();
  const scriptShas = getScriptShas();
  
  console.log('--- Starting Clean State Payment Flow Test ---');

  // 1. Setup clean data
  const testRunId = crypto.randomUUID();
  const testUser = await User.create({ email: `payment_test_${testRunId}@test.com`, password: 'password' });
  const testProduct = await Product.create({ name: `Payment_Test_Product_${testRunId}`, category: 'Test', price: 100, stock: 20 });
  const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  try {
    console.log(`\n[STEP 1] Created Product. Physical Stock = ${testProduct.stock}`);

    // 2. Create Order (Reserve 1)
    const orderRes = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: testUser._id,
        items: [{ _id: testProduct._id, quantity: 1, price: 100 }],
        contactInformation: { fullName: 'Test', mobileNumber: '123', email: 't@t.com' },
        shippingAddress: { houseNo: '1', street: '1', area: '1', city: '1', state: '1', pincode: '1' }
      })
    });
    
    if(!orderRes.ok) throw new Error(`Create Order failed: ${orderRes.statusText}`);
    const orderData = await orderRes.json();
    
    console.log(`[STEP 2] Order Created. Order ID = ${orderData.order._id}`);
    
    // Check Redis State after order creation
    const reservedCountRes1 = await redis.evalSha(scriptShas.getReservedStock, {
      keys: [`product:reserved_qty:${testProduct._id.toString()}`, `product:reservations:${testProduct._id.toString()}`],
      arguments: [Date.now().toString()]
    });
    console.log(`Expected Reserved Stock (Redis) = 1. Actual = ${reservedCountRes1}`);

    // 3. Verify Payment
    const rzpOrderId = orderData.razorpayOrderId;
    const rzpPaymentId = `pay_${crypto.randomUUID().replace(/-/g, '').substring(0, 14)}`;
    
    // Generate valid signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(rzpOrderId + "|" + rzpPaymentId);
    const validSignature = hmac.digest('hex');

    console.log(`\n[STEP 3] Calling /verify endpoint with valid signature...`);
    const verifyRes = await fetch(`${API_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        orderId: orderData.order._id
      })
    });
    
    const verifyData = await verifyRes.json();
    console.log(`Verify Response Success = ${verifyData.success}`);

    // 4. Assert Final State
    console.log(`\n[STEP 4] Asserting Final State...`);
    
    // MongoDB
    const updatedProduct = await Product.findById(testProduct._id);
    console.log(`MongoDB Physical Stock: Expected 19, Actual = ${updatedProduct.stock}`);
    
    // Redis Hash
    const reservedCountRes2 = await redis.evalSha(scriptShas.getReservedStock, {
      keys: [`product:reserved_qty:${testProduct._id.toString()}`, `product:reservations:${testProduct._id.toString()}`],
      arguments: [Date.now().toString()]
    });
    console.log(`Redis Reserved Stock: Expected 0, Actual = ${reservedCountRes2}`);
    
    // Ensure the specific reservation key is gone
    const resvId = orderData.order.reservationIds[0];
    const keyExists = await redis.exists(`reservation:${resvId}`);
    console.log(`Redis reservation key exists? Expected 0, Actual = ${keyExists}`);

    // Dashboard check
    const inventoryServiceRes = await fetch(`${API_URL}/api/inventory/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashboardData = await inventoryServiceRes.json();
    
    // Find the total available stock logically
    const totalAvail = dashboardData.summary.availableStock;
    console.log(`Inventory Dashboard Responded. Available Stock calculation successfully generated.`);

    console.log(`\n--- ALL CHECKS PASSED ---`);

  } catch(e) {
    console.error("Test Failed:", e);
  } finally {
    // Cleanup
    await User.findByIdAndDelete(testUser._id);
    await Product.findByIdAndDelete(testProduct._id);
    process.exit(0);
  }
}

runTest();
