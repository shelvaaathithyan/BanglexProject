const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const emailValidator = require('deep-email-validator');

async function checkEmailValidity(email) {
  // We disable SMTP because many providers (like Yahoo) block verification
  // But we keep regex, MX, typo, and disposable checks
  return emailValidator.validate({
    email: email,
    validateRegex: true,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: true // Attempt SMTP check to verify mailbox existence
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
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=true', session: false }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:5173/login?token=${token}&role=${req.user.role}`);
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

module.exports = router;
