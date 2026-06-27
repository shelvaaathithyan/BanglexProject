const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const twilio = require('twilio');

// Initialize Twilio Client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const emailValidator = require('deep-email-validator');

async function checkEmailValidity(email) {
  // We disable SMTP because many providers (like Yahoo and Universities) block verification
  // But we keep regex, MX, typo, and disposable checks
  return emailValidator.validate({
    email: email,
    validateRegex: true,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: false // Disabled because many domains block SMTP ping checks
  });
}

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// @route   POST /auth/signup
// @desc    Register a user and send verification OTP
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const emailValidation = await checkEmailValidity(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: 'This email address does not appear to exist or is invalid.' });
    }

    let user = await User.findOne({ email });
    if (user) {
      if (user.isVerified) {
        const isMatch = await user.validatePassword(password);
        if (isMatch) {
          const token = generateToken(user);
          return res.status(200).json({ 
            message: 'User already exists. Logging you in...', 
            alreadyExists: true,
            token, 
            user: { id: user._id, email: user.email, role: user.role } 
          });
        } else {
          return res.status(400).json({ message: 'User already exists. Please switch to login and enter your correct password.', userExists: true });
        }
      } else {
        // If user exists but not verified, update password and resend OTP
        user.password = password;
      }
    } else {
      user = new User({ email, password, role: 'user' });
    }

    const otp = generateOtp();
    user.verificationOtp = otp;
    user.verificationOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log('\n=============================================');
    console.log(`🔑 SIGNUP OTP FOR ${email}: ${otp}`);
    console.log('=============================================\n');

    await sendEmail(email, 'Verify your Banglex account', `Your verification code is: ${otp}\nThis code is valid for 10 minutes.`);

    res.status(200).json({ message: 'Verification OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /auth/verify-email
// @desc    Verify the email using OTP
router.post('/verify-email', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    if (user.verificationOtp !== otp || user.verificationOtpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpiry = undefined;
    await user.save();

    const token = generateToken(user);
    res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });
    
    if (!user.isVerified) return res.status(400).json({ message: 'Please verify your email first', needsVerification: true });

    const isMatch = await user.validatePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = generateToken(user);
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /auth/forgot-password
// @desc    Send password reset OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const emailValidation = await checkEmailValidity(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: 'This email address does not appear to exist or is invalid.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log('\n=============================================');
    console.log(`🔑 RESET PASSWORD OTP FOR ${email}: ${otp}`);
    console.log('=============================================\n');

    await sendEmail(email, 'Password Reset OTP', `Your password reset code is: ${otp}\nThis code is valid for 10 minutes.`);

    res.status(200).json({ message: 'Password reset OTP sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /auth/verify-reset-otp
// @desc    Verify reset OTP
router.post('/verify-reset-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.resetOtp !== otp || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /auth/reset-password
// @desc    Reset password using OTP
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.resetOtp !== otp || user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Google routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=true`, session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?token=${token}&role=${req.user.role}`);
  }
);

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// @route   PUT /auth/profile
// @desc    Update user profile details
router.put('/profile', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { firstName, lastName, address } = req.body;
    
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { $set: { firstName, lastName, address } },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /auth/whatsapp/send-otp
// @desc    Send WhatsApp login OTP
router.post('/whatsapp/send-otp', async (req, res) => {
  const { whatsappNumber } = req.body;
  if (!whatsappNumber) return res.status(400).json({ message: 'WhatsApp number is required' });

  try {
    let user = await User.findOne({ whatsappNumber });
    
    if (!user) {
      // Create a dummy user for WhatsApp login
      const dummyEmail = `wa_${whatsappNumber}@banglex.com`;
      user = new User({ email: dummyEmail, whatsappNumber, role: 'user', isVerified: true });
    }

    const otp = generateOtp();
    user.verificationOtp = otp;
    user.verificationOtpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log('\n=============================================');
    console.log(`💬 WHATSAPP OTP FOR ${whatsappNumber}: ${otp}`);
    console.log('=============================================\n');

    // Send the real WhatsApp message via Twilio
    try {
      const message = await twilioClient.messages.create({
        body: `Welcome to Banglex! Your verification code is: *${otp}*\n\nDo not share this code with anyone.`,
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${whatsappNumber.replace(/\s/g, '')}` // Strip spaces
      });
      console.log(`💬 Twilio WhatsApp message sent: ${message.sid}`);
      res.status(200).json({ message: 'OTP sent to your WhatsApp number.' });
    } catch (twilioErr) {
      console.error('Twilio Error:', twilioErr);
      res.status(500).json({ message: 'Failed to send WhatsApp message. Ensure you have joined the Twilio Sandbox.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /auth/whatsapp/verify
// @desc    Verify WhatsApp OTP
router.post('/whatsapp/verify', async (req, res) => {
  const { whatsappNumber, otp } = req.body;
  if (!whatsappNumber || !otp) return res.status(400).json({ message: 'WhatsApp number and OTP are required' });

  try {
    const user = await User.findOne({ whatsappNumber });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (user.verificationOtp !== otp || user.verificationOtpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.verificationOtp = undefined;
    user.verificationOtpExpiry = undefined;
    await user.save();

    const token = generateToken(user);
    res.status(200).json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
