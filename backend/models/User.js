const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  whatsappNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  address: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOtp: {
    type: String
  },
  verificationOtpExpiry: {
    type: Date
  },
  resetOtp: {
    type: String
  },
  resetOtpExpiry: {
    type: Date
  }
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.validatePassword = async function (data) {
  return bcrypt.compare(data, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
