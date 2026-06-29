require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { createClient } = require('redis');
const fs = require('fs');

async function debugVerify() {
  await mongoose.connect(process.env.MONGODB_URI);
  const redis = createClient({ url: 'redis://127.0.0.1:6379' });
  await redis.connect();

  const reserveScript = fs.readFileSync('../redis/reserveInventory.lua', 'utf8');
  const releaseScript = fs.readFileSync('../redis/releaseReservation.lua', 'utf8');
  const reserveSha = await redis.scriptLoad(reserveScript);
  const releaseSha = await redis.scriptLoad(releaseScript);

  const Product = require('../models/Product');
  const product = await Product.create({ name: 'VerifyDebugProduct', price: 100, stock: 10, category: 'Test' });
  
  const reservationId = new mongoose.Types.ObjectId().toString();
  console.log('Reserving...', reservationId);
  
  const res1 = await redis.evalSha(reserveSha, {
    keys: [
      `product:reserved:${product._id}`,
      `reservation:${reservationId}`,
      `product:reservations:${product._id}`
    ],
    arguments: [
      "1", // quantity
      "10", // stock
      "testUserId",
      "600",
      product._id.toString(),
      reservationId
    ]
  });
  console.log('Reserve Result:', res1);
  
  const reservedCount = await redis.get(`product:reserved:${product._id}`);
  console.log('Reserved Count after reserve:', reservedCount);
  
  // Simulate verify logic (no populate)
  const item_product = product._id;
  const resvId = reservationId;

  console.log('Releasing...');
  const resvBefore = await redis.exists(`reservation:${resvId}`);
  const counterBefore = await redis.get(`product:reserved:${item_product}`);
  console.log(`Before: Exists=${resvBefore}, Counter=${counterBefore}`);

  const res2 = await redis.evalSha(releaseSha, {
    keys: [
      `product:reserved:${item_product}`,
      `reservation:${resvId}`,
      `product:reservations:${item_product}`
    ],
    arguments: [resvId]
  });
  console.log('Release Result:', res2);
  
  const resvAfter = await redis.exists(`reservation:${resvId}`);
  const counterAfter = await redis.get(`product:reserved:${item_product}`);
  console.log(`After: Exists=${resvAfter}, Counter=${counterAfter}`);

  await Product.findByIdAndDelete(product._id);
  process.exit(0);
}
debugVerify();
