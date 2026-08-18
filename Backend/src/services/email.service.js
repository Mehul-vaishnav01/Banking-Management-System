require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Mehul Vaishnav" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;


async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to Banking Management System";

    const text = `
Hello ${name},

Thank you for registering at Banking Management System. We are excited to have you on board!

Best regards,
The Banking Management System Team
`;

    const html = `
        <p>Hello ${name},</p>

        <p>
            Thank you for registering at Banking Management System.
            We are excited to have you on board!
        </p>

        <p>
            Best regards,<br>
            The Banking Management System Team
        </p>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendLoginEmail(userEmail, name) {
    const subject = "Login Successful - Banking Management System";

    const text = `
Hello ${name},

You have successfully logged in to your Banking Management System account.

If this login was not made by you, please contact support immediately.

Best regards,
The Banking Management System Team
`;

    const html = `
        <p>Hello ${name},</p>

        <p>
            You have successfully logged in to your
            <strong>Banking Management System</strong> account.
        </p>

        <p>
            If this login was not made by you, please contact support immediately.
        </p>

        <p>
            Best regards,<br>
            The Banking Management System Team
        </p>
    `;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = {sendRegistrationEmail,sendLoginEmail};