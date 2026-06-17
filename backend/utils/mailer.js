const nodemailer = require('nodemailer');

let transporter = null;

async function setupMailer() {
  // Use user-provided credentials if available
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('Nodemailer configured with provided Gmail credentials.');
  } else {
    // Fallback to Ethereal Email for testing if no credentials are provided
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass  // generated ethereal password
      }
    });
    console.log('Nodemailer configured with Ethereal Email (Testing Mode).');
  }
}

setupMailer();

const sendEmail = async (to, subject, text) => {
  if (!transporter) await setupMailer();
  
  let info = await transporter.sendMail({
    from: '"Banglex App" <noreply@banglex.com>',
    to,
    subject,
    text
  });

  console.log('Message sent: %s', info.messageId);
  // Log the ethereal URL for viewing in browser if using ethereal
  if (!process.env.EMAIL_USER) {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = { sendEmail };
