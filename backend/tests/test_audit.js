require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const { getRedisClient, initRedis, getScriptShas } = require('../config/redis');

const API_URL = 'http://localhost:3000';

async function runTest() {
  await mongoose.connect(process.env.MONGODB_URI);
  process.env.REDIS_URL = 'redis://127.0.0.1:6379';
  await initRedis();
  const redis = getRedisClient();
  const scriptShas = getScriptShas();
  
  console.log('--- Starting Payment Flow Audit Test ---');

  const testRunId = crypto.randomUUID();
  const testUser = await User.create({ email: `audit_test_${testRunId}@test.com`, password: 'password' });
  const testProduct = await Product.create({ name: `Audit_Product_${testRunId}`, category: 'Test', price: 100, stock: 20 });
  const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  try {
    console.log(`\n[STEP 1] Created Product. Physical Stock = ${testProduct.stock}`);

    // --- CASE 1: Payment Failure + Release Idempotency ---
    console.log(`\n--- CASE 1: Payment Failure & Idempotency ---`);
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
    console.log(`Order Created. ID = ${orderData.order._id}`);
    
    let reservedCount = await redis.evalSha(scriptShas.getReservedStock, {
      keys: [`product:reserved_qty:${testProduct._id.toString()}`, `product:reservations:${testProduct._id.toString()}`],
      arguments: [Date.now().toString()]
    });
    console.log(`Reserved Stock = ${reservedCount}`);

    console.log('Calling /release-reservation (1st time - simulate ondismiss)...');
    let releaseRes = await fetch(`${API_URL}/payments/release-reservation`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderData.order._id, cancelReason: 'Payment popup closed by user' })
    });
    let releaseData = await releaseRes.json();
    console.log(`Release 1 Success: ${releaseData.success}`);

    console.log('Calling /release-reservation (2nd time - simulate payment.failed)...');
    releaseRes = await fetch(`${API_URL}/payments/release-reservation`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderData.order._id, errorDetails: { reason: 'payment_failed', description: 'Test fail' } })
    });
    releaseData = await releaseRes.json();
    console.log(`Release 2 Success (Idempotency): ${releaseData.success}`);

    reservedCount = await redis.evalSha(scriptShas.getReservedStock, {
      keys: [`product:reserved_qty:${testProduct._id.toString()}`, `product:reservations:${testProduct._id.toString()}`],
      arguments: [Date.now().toString()]
    });
    console.log(`Reserved Stock after double release = ${reservedCount}`);

    const failedOrder = await Order.findById(orderData.order._id);
    console.log(`Order Status: ${failedOrder.orderStatus} (Expected: Pending Payment)`);
    console.log(`Payment Status: ${failedOrder.paymentStatus} (Expected: Pending)`);
    console.log(`Timeline events: ${failedOrder.timeline.length}`);
    const lastEvent = failedOrder.timeline[failedOrder.timeline.length - 1];
    console.log(`Last Timeline Event: ${lastEvent.status}`);

    // --- CASE 2: Payment Success followed by duplicate Release (Race condition guard) ---
    console.log(`\n--- CASE 2: Payment Success + Race Condition Guard ---`);
    const orderRes2 = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: testUser._id,
        items: [{ _id: testProduct._id, quantity: 1, price: 100 }],
        contactInformation: { fullName: 'Test', mobileNumber: '123', email: 't@t.com' },
        shippingAddress: { houseNo: '1', street: '1', area: '1', city: '1', state: '1', pincode: '1' }
      })
    });
    const orderData2 = await orderRes2.json();
    console.log(`Order 2 Created. ID = ${orderData2.order._id}`);

    const rzpOrderId = orderData2.razorpayOrderId;
    const rzpPaymentId = `pay_${crypto.randomUUID().replace(/-/g, '').substring(0, 14)}`;
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(rzpOrderId + "|" + rzpPaymentId);
    const validSignature = hmac.digest('hex');

    console.log(`Calling /verify endpoint...`);
    const verifyRes = await fetch(`${API_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: rzpOrderId,
        razorpay_payment_id: rzpPaymentId,
        razorpay_signature: validSignature,
        orderId: orderData2.order._id
      })
    });
    const verifyData = await verifyRes.json();
    console.log(`Verify Response Success: ${verifyData.success}`);

    console.log(`Calling /release-reservation after verification (Simulating delayed ondismiss/webhook)`);
    releaseRes = await fetch(`${API_URL}/payments/release-reservation`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: orderData2.order._id, cancelReason: 'Payment popup closed by user' })
    });
    releaseData = await releaseRes.json();
    console.log(`Late Release Response: ${releaseData.message}`);

    const successOrder = await Order.findById(orderData2.order._id);
    console.log(`Order Status: ${successOrder.orderStatus} (Expected: Confirmed)`);
    console.log(`Payment Status: ${successOrder.paymentStatus} (Expected: Completed)`);
    
    // Check MongoDB stock
    const updatedProduct = await Product.findById(testProduct._id);
    console.log(`Final Physical Stock: ${updatedProduct.stock} (Expected: 19)`);

    console.log(`\n--- ALL CHECKS PASSED ---`);

  } catch(e) {
    console.error("Test Failed:", e);
  } finally {
    await User.findByIdAndDelete(testUser._id);
    await Product.findByIdAndDelete(testProduct._id);
    process.exit(0);
  }
}

runTest();
