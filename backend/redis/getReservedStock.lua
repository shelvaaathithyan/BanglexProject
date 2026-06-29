local reservedQtyKey = KEYS[1]
local reservationsSetKey = KEYS[2]
local now = tonumber(redis.call("TIME")[1])

-- Cleanup expired
local expired = redis.call("ZRANGEBYSCORE", reservationsSetKey, 0, now)
for _, resId in ipairs(expired) do
    redis.call("HDEL", reservedQtyKey, resId)
end
redis.call("ZREMRANGEBYSCORE", reservationsSetKey, 0, now)

-- Sum remaining active
local allActive = redis.call("HVALS", reservedQtyKey)
local total = 0
for _, q in ipairs(allActive) do
    total = total + tonumber(q)
end

return total
