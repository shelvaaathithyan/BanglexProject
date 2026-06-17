require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const bcrypt = require('bcrypt');
const session = require('express-session');

const authRoutes = require('./routes/auth');
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session required for Passport Google Auth
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    
    // Force drop the old username index to prevent duplicate key errors
    try {
      await mongoose.connection.collection('users').dropIndex('username_1');
    } catch (e) {
      // Ignore if index doesn't exist
    }

    // Seed Admin User
    try {
      const adminExists = await User.findOne({ email: 'admin@banglex.com' });
      if (!adminExists) {
        const newAdmin = new User({
          email: 'admin@banglex.com',
          password: 'admin123',
          role: 'admin',
          isVerified: true
        });
        await newAdmin.save();
        console.log('Default Admin user seeded (admin@banglex.com / admin123)');
      }
    } catch (err) {
      console.error('Error seeding admin user:', err);
    }
  })
  .catch(err => console.log('MongoDB Connection Error: ', err));

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Banglex API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
