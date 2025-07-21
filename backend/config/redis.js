  // backend/config/redis.js
  const Redis = require('ioredis');
  require('dotenv').config();

  // AFTER
const redisClient = new Redis(process.env.REDIS_URL);
  // Connect to Redis
  redisClient.on('connect', () => {
    console.log('Redis connected');
  });

  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });

  module.exports = redisClient;
