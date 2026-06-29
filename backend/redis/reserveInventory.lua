local reservedQtyKey = KEYS[1]
local reservationKey = KEYS[2]
local reservationsSetKey = KEYS[3]

local requestedQty = tonumber(ARGV[1])
local physicalStock = tonumber(ARGV[2])
local userId = ARGV[3]
local ttl = tonumber(ARGV[4])
local productId = ARGV[5]
local reservationId = ARGV[6]
local now = tonumber(redis.call("TIME")[1])
local expireTimestamp = now + ttl

-- 1. Self-Cleaning: Remove expired reservations for this product
local expired = redis.call("ZRANGEBYSCORE", reservationsSetKey, 0, now)
for _, resId in ipairs(expired) do
    redis.call("HDEL", reservedQtyKey, resId)
end
redis.call("ZREMRANGEBYSCORE", reservationsSetKey, 0, now)

-- 2. Calculate current active reserved stock
local allActive = redis.call("HVALS", reservedQtyKey)
local currentReserved = 0
for _, q in ipairs(allActive) do
    currentReserved = currentReserved + tonumber(q)
end

-- 3. Check if we have enough stock
local available = physicalStock - currentReserved

if available >= requestedQty then
    -- 4. Store the reservation quantity
    redis.call("HSET", reservedQtyKey, reservationId, requestedQty)
    
    -- 5. Store the expiration timestamp in ZSET
    redis.call("ZADD", reservationsSetKey, expireTimestamp, reservationId)
    
    -- 6. Store metadata hash (with TTL as a fallback to save memory)
    redis.call("HSET", reservationKey, 
        "reservationId", reservationId,
        "userId", userId,
        "productId", productId,
        "quantity", requestedQty,
        "createdAt", now
    )
    redis.call("EXPIRE", reservationKey, ttl + 60)
    
    return "SUCCESS"
else
    return "INSUFFICIENT_STOCK"
end
