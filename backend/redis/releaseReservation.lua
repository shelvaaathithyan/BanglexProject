local reservedKey = KEYS[1]
local reservationKey = KEYS[2]
local reservationsSetKey = KEYS[3]
local reservationId = ARGV[1]

-- Check if reservation exists
if redis.call("EXISTS", reservationKey) == 1 then
    -- Get quantity reserved to decrement
    local quantity = tonumber(redis.call("HGET", reservationKey, "quantity") or "0")
    
    -- Delete reservation hash
    redis.call("DEL", reservationKey)
    
    -- Remove from product active reservations set
    if reservationsSetKey then
        redis.call("SREM", reservationsSetKey, reservationId)
    end
    
    -- Decrement the global reserved counter
    if quantity > 0 then
        local newReserved = redis.call("DECRBY", reservedKey, quantity)
        if newReserved <= 0 then
            redis.call("DEL", reservedKey)
        end
    end
    
    return "SUCCESS"
else
    return "NOT_FOUND"
end
