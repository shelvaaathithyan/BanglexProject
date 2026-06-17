const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    try {
      await mongoose.connection.collection('users').dropIndex('username_1');
      console.log('Successfully dropped username_1 index');
    } catch (err) {
      console.log('Error dropping index (it might not exist):', err.message);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
