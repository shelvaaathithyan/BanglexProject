const fs = require('fs');
let c = fs.readFileSync('routes/payments.js', 'utf8');

c = c.replace(/arguments: \[\s*item\.quantity\.toString\(\),\s*product\.stock\.toString\(\),\s*user,\s*ttl\.toString\(\),/g, `arguments: [
              item.quantity.toString(),
              product.stock.toString(),
              typeof user === 'string' ? user : (user._id || user.id).toString(),
              ttl.toString(),`);

c = c.replace(/return \`ORD-\$\{year\}\$\{month\}\$\{nextSeq\}\`;/g, `const uniqueId = require('crypto').randomBytes(3).toString('hex').toUpperCase();
  return \`ORD-\$\{year\}\$\{month\}-\$\{uniqueId\}\`;`);

const extra = `
// POST /api/payments/release-reservation
router.post('/release-reservation', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'Order ID is required' });
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const { getScriptShas, getRedisClient } = require('../config/redis');
    const redis = getRedisClient();
    const scriptShas = getScriptShas();
    if (order.reservationIds && order.reservationIds.length > 0) {
      for (let i = 0; i < order.reservationIds.length; i++) {
        const resvId = order.reservationIds[i];
        const item = order.items[i];
        if (item && item.product) {
          try {
            await redis.evalSha(scriptShas.releaseReservation, {
              keys: [
                \`product:reserved:\${item.product._id}\`,
                \`reservation:\${resvId}\`,
                \`product:reservations:\${item.product._id}\`
              ],
              arguments: [resvId]
            });
          } catch (e) {}
        }
      }
      order.reservationIds = [];
      await order.save();
    }
    res.json({ message: 'Reservations released' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/payments/clear-reservations
router.post('/clear-reservations', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });
    const pendingOrders = await Order.find({ user: userId, status: 'Pending', 'reservationIds.0': { $exists: true } }).populate('items.product');
    const { getScriptShas, getRedisClient } = require('../config/redis');
    const redis = getRedisClient();
    const scriptShas = getScriptShas();
    for (const order of pendingOrders) {
      if (order.reservationIds && order.reservationIds.length > 0) {
        for (let i = 0; i < order.reservationIds.length; i++) {
          const resvId = order.reservationIds[i];
          const item = order.items[i];
          if (item && item.product) {
            try {
              await redis.evalSha(scriptShas.releaseReservation, {
                keys: [
                  \`product:reserved:\${item.product._id}\`,
                  \`reservation:\${resvId}\`,
                  \`product:reservations:\${item.product._id}\`
                ],
                arguments: [resvId]
              });
            } catch (e) {}
          }
        }
        order.reservationIds = [];
        await order.save();
      }
    }
    res.json({ message: 'All reservations cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;`;

c = c.replace(/module\.exports = router;/g, extra);
fs.writeFileSync('routes/payments.js', c);
