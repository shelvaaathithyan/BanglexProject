local reservedKey = KEYS[1]
local reservationKey = KEYS[2]
local reservationsSetKey = KEYS[3]

local requestedQty = tonumber(ARGV[1])
local physicalStock = tonumber(ARGV[2])
local userId = ARGV[3]
local ttl = tonumber(ARGV[4])
local productId = ARGV[5]
local reservationId = ARGV[6]

local currentReserved = tonumber(redis.call("GET", reservedKey) or "0")
local available = physicalStock - currentReserved

if available >= requestedQty then
    -- Update total reserved stock
    redis.call("INCRBY", reservedKey, requestedQty)
    
    -- Store reservation details
    local now = redis.call("TIME")[1]
    redis.call("HSET", reservationKey, 
        "reservationId", reservationId,
        "userId", userId,
        "productId", productId,
        "quantity", requestedQty,
        "createdAt", now
    )
    redis.call("EXPIRE", reservationKey, ttl)
    
    -- Add to product active reservations set
    redis.call("SADD", reservationsSetKey, reservationId)
    
    return "SUCCESS"
else
    return "INSUFFICIENT_STOCK"
end
