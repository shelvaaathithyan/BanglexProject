require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const { createClient } = require('redis');
const fs = require('fs');

async function testTtlLeak() {
  await mongoose.connect(process.env.MONGODB_URI);
  const redis = createClient({ url: 'redis://127.0.0.1:6379' });
  await redis.connect();

  const reserveScript = fs.readFileSync('../redis/reserveInventory.lua', 'utf8');
  const reserveSha = await redis.scriptLoad(reserveScript);

  const Product = require('../models/Product');
  const product = await Product.create({ name: 'TTLDebugProduct', price: 100, stock: 10, category: 'Test' });
  
  const reservationId = new mongoose.Types.ObjectId().toString();
  console.log('Reserving with 1 second TTL...');
  
  await redis.evalSha(reserveSha, {
    keys: [
      `product:reserved:${product._id}`,
      `reservation:${reservationId}`,
      `product:reservations:${product._id}`
    ],
    arguments: ["1", "10", "testUserId", "1", product._id.toString(), reservationId]
  });
  
  const reservedCount1 = await redis.get(`product:reserved:${product._id}`);
  console.log('Reserved Count after reserve:', reservedCount1);
  
  console.log('Waiting 2 seconds for TTL to expire...');
  await new Promise(r => setTimeout(r, 2000));

  const resvExists = await redis.exists(`reservation:${reservationId}`);
  console.log('Reservation Hash Exists:', resvExists);

  const reservedCount2 = await redis.get(`product:reserved:${product._id}`);
  console.log('Reserved Count after TTL expiry:', reservedCount2);

  await Product.findByIdAndDelete(product._id);
  process.exit(0);
}
testTtlLeak();
