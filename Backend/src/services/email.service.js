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

async function sendTransactionEmail(userEmail, name, amount, toAccount)
{
    const subject = "Transaction Successful - Bank System";

    const text = `Hi ${name},

Your transaction has been successfully completed.

Transaction Details:
Amount: ₹${amount}
Transferred To Account: ${toAccount}

If you did not perform this transaction, please contact the bank immediately.

Best Regards,
Pratik Lachwani
Founder`;

    const html = `
        <h2>Transaction Successful</h2>

        <p>Hi ${name},</p>

        <p>
            Your transaction has been successfully completed.
        </p>

        <h3>Transaction Details</h3>

        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Transferred To:</strong> ${toAccount}</p>

        <p>
            If you did not perform this transaction, please contact
            the bank immediately.
        </p>

        <br>

        <p>Best Regards,</p>
        <p><strong>Pratik Lachwani</strong></p>
        <p>Founder</p>
    `;

    await sendEmail(userEmail, subject, text, html);
}


async function sendTransactionFailureEmail(userEmail, name, amount, toAccount)
{
    const subject = "Transaction Failed - Bank System";

    const text = `Hi ${name},

Your attempted transaction could not be completed.

Transaction Details:
Amount: ₹${amount}
Attempted Transfer To Account: ${toAccount}

Please check your account balance and transaction details and try again.

If you believe this was an error, please contact the bank.

Best Regards,
Pratik Lachwani
Founder`;

    const html = `
        <h2>Transaction Failed</h2>

        <p>Hi ${name},</p>

        <p>
            Unfortunately, your attempted transaction could not be completed.
        </p>

        <h3>Transaction Details</h3>

        <p><strong>Amount:</strong> ₹${amount}</p>
        <p><strong>Attempted Transfer To:</strong> ${toAccount}</p>

        <p>
            Please check your account balance and transaction details
            and try again.
        </p>

        <p>
            If you believe this was an error, please contact the bank.
        </p>

        <br>

        <p>Best Regards,</p>
        <p><strong>Pratik Lachwani</strong></p>
        <p>Founder</p>
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

module.exports = {sendRegistrationEmail,sendLoginEmail,sendTransactionFailureEmail,sendTransactionEmail};