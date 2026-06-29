const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay SDK
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Verify Razorpay Signature
 * @param {string} orderId - Razorpay Order ID
 * @param {string} paymentId - Razorpay Payment ID
 * @param {string} signature - Razorpay Signature
 * @returns {boolean} - True if signature is valid
 */
const verifySignature = (orderId, paymentId, signature) => {
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');
    
  return generatedSignature === signature;
};

/**
 * Verify Webhook Signature
 * @param {string} body - Raw request body
 * @param {string} signature - 'x-razorpay-signature' header
 * @param {string} secret - Webhook secret from dashboard
 * @returns {boolean}
 */
const verifyWebhookSignature = (body, signature, secret) => {
  return Razorpay.validateWebhookSignature(body, signature, secret);
};

module.exports = {
  razorpay,
  verifySignature,
  verifyWebhookSignature
};
