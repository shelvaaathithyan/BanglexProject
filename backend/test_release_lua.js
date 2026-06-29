require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');
const { getRedisClient, initRedis, getScriptShas } = require('./config/redis');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  process.env.REDIS_URL = 'redis://127.0.0.1:6379';
  await initRedis();
  const redis = getRedisClient();
  const scriptShas = getScriptShas();
  
  // Create dummy product
  const productId = new mongoose.Types.ObjectId();
  const resvId = new mongoose.Types.ObjectId().toString();
  
  // manually reserve
  await redis.evalSha(scriptShas.reserveInventory, {
      keys: [`product:reserved_qty:${productId}`, `reservation:${resvId}`, `product:reservations:${productId}`],
      arguments: ["1", "20", "user123", "600", productId.toString(), resvId]
  });
  
  const before = await redis.hGetAll(`product:reserved_qty:${productId}`);
  console.log("Before:", before);
  
  // now simulate the verify logic exactly
  // Note: productId is an ObjectId object here, just like in payments.js verify
  try {
      await redis.evalSha(scriptShas.releaseReservation, {
          keys: [
            `product:reserved_qty:${productId}`,
            `reservation:${resvId}`,
            `product:reservations:${productId}`
          ],
          arguments: [resvId]
      });
      console.log("Executed release");
  } catch(e) {
      console.error("Caught error:", e);
  }
  
  const after = await redis.hGetAll(`product:reserved_qty:${productId}`);
  console.log("After:", after);
  
  process.exit(0);
}

run();
