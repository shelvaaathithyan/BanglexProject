require('dotenv').config();
const mongoose = require('mongoose');
const Festival = require('./models/Festival');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const allFestivals = await Festival.find({});
  console.log(JSON.stringify(allFestivals, null, 2));
  mongoose.connection.close();
});
