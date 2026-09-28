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
    // If not in development mode, we should throw an error to avoid silent failures
    if (process.env.NODE_ENV === 'production' || !process.env.NODE_ENV) {
      console.error('❌ ERROR: EMAIL_USER and EMAIL_PASS environment variables are missing.');
      console.error('Email sending will fail. Please configure your .env file.');
      // Still fallback to ethereal just so the app doesn't crash completely, but throw error in sendEmail
      // Actually let's just let it be ethereal but warn loudly. 
      // But to prevent the user from thinking it worked, let's not create transporter so it fails.
      throw new Error("Missing EMAIL_USER and EMAIL_PASS environment variables in production");
    }

    // Fallback to Ethereal Email for testing if no credentials are provided (development only)
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

setupMailer().catch(err => console.error("Mailer Setup Error:", err.message));

const sendEmail = async (to, subject, text) => {
  if (!transporter) await setupMailer();
  
  let info = await transporter.sendMail({
    from: `"RaHa Creations" <${process.env.EMAIL_USER || 'banglexproject@gmail.com'}>`,
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
