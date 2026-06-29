require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Mongoose Connection Plugin
mongoose.plugin((schema) => {
  schema.add({ isTestData: { type: Boolean, default: false }, testRunId: { type: String } });
});

const Product = require('../models/Product');
const { createClient } = require('redis');
const fs = require('fs');

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);
  const redis = createClient({ url: 'redis://127.0.0.1:6379' });
  await redis.connect();

  const reserveScript = fs.readFileSync('../redis/reserveInventory.lua', 'utf8');
  const releaseScript = fs.readFileSync('../redis/releaseReservation.lua', 'utf8');
  const reserveSha = await redis.scriptLoad(reserveScript);
  const releaseSha = await redis.scriptLoad(releaseScript);

  const product = await Product.create({ name: 'DebugProduct', category: 'Test', price: 100, stock: 10 });
  
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
  
  console.log('Releasing...', reservationId);
  const res2 = await redis.evalSha(releaseSha, {
    keys: [
      `product:reserved:${product._id}`,
      `reservation:${reservationId}`,
      `product:reservations:${product._id}`
    ],
    arguments: [ reservationId ]
  });
  console.log('Release Result:', res2);
  
  const reservedCountAfter = await redis.get(`product:reserved:${product._id}`);
  console.log('Reserved Count after release:', reservedCountAfter);
  
  await Product.findByIdAndDelete(product._id);
  process.exit(0);
}
debug();
