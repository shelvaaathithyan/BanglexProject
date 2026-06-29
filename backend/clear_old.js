require('dotenv').config({ path: '.env' });
const { getRedisClient, initRedis, getScriptShas } = require('./config/redis');
async function run() {
  process.env.REDIS_URL = 'redis://127.0.0.1:6379';
  await initRedis();
  const redis = getRedisClient();
  const scriptShas = getScriptShas();
  const futureTime = (Date.now() + 600000).toString(); // 10 mins in future
  
  await redis.evalSha(scriptShas.getReservedStock, {
      keys: [`product:reserved_qty:6a3fa46444ce19818cfd2775`, `product:reservations:6a3fa46444ce19818cfd2775`],
      arguments: [futureTime]
  });
  console.log("Cleared old reservations.");
  process.exit(0);
}
run();
