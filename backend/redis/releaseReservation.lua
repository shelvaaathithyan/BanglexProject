local reservedQtyKey = KEYS[1]
local reservationKey = KEYS[2]
local reservationsSetKey = KEYS[3]
local reservationId = ARGV[1]

redis.call("HDEL", reservedQtyKey, reservationId)
redis.call("DEL", reservationKey)
redis.call("ZREM", reservationsSetKey, reservationId)

return "SUCCESS"
