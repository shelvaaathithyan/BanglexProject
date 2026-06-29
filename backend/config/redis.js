const { createClient } = require('redis');
const fs = require('fs');
const path = require('path');

let redisClient;
const scriptShas = {};

const initRedis = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => console.log('Redis Client Error', err));
  
  await redisClient.connect();
  console.log('Redis Connected');

  // Load Lua Scripts
  try {
    const reserveScript = fs.readFileSync(path.join(__dirname, '../redis/reserveInventory.lua'), 'utf8');
    const releaseScript = fs.readFileSync(path.join(__dirname, '../redis/releaseReservation.lua'), 'utf8');

    // Load scripts into Redis and get SHAs
    scriptShas.reserveInventory = await redisClient.scriptLoad(reserveScript);
    scriptShas.releaseReservation = await redisClient.scriptLoad(releaseScript);
    
    console.log('Lua Scripts Loaded successfully via SCRIPT LOAD.');
  } catch (err) {
    console.error('Failed to load Lua scripts:', err);
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error("Redis client is not initialized. Call initRedis() first.");
  }
  return redisClient;
};

const getScriptShas = () => scriptShas;

module.exports = { initRedis, getRedisClient, getScriptShas };
