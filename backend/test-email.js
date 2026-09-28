require('dotenv').config();
const { sendEmail } = require('./utils/mailer');

async function test() {
  try {
    await sendEmail('test@example.com', 'Test', 'This is a test');
    console.log('Success');
  } catch (err) {
    console.error(err);
  }
}
test();
