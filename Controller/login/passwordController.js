const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../../schema/Employee/userSchema'); // Assuming you have a User model
const bcrypt = require('bcryptjs');
require('dotenv').config();

console.log("Outlook Email: ", process.env.OUTLOOK_EMAIL);
console.log("Outlook Password: ", process.env.OUTLOOK_PASSWORD ? "********" : "Not Set");
const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com', // Correct hostname for Outlook
  port: 587, // Use 587 for TLS (STARTTLS)
  secure: false, // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASSWORD,
  },
  tls: {
     ciphers: 'SSLv3',
    rejectUnauthorized: false, // Add this if you're testing and getting self-signed certificate errors
  },
});

exports.forgotPassword = async (req, res) => {
  const { officeEmail } = req.body;
  try {
    const user = await User.findOne({ officeEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const mailOptions = {
      from: process.env.OUTLOOK_EMAIL,
      to: user.officeEmail,
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
        Please click on the following link, or paste this into your browser to complete the process:
        http://172.16.2.6:3000/HTML/resetpassword.html/${token}
        If you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    // Log mail options to verify they are set correctly
    console.log('Mail Options:', mailOptions);

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error('There was an error:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
      res.status(200).json({ message: 'Recovery email sent' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { enterPassword, confirmPassword } = req.body;

  if (enterPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Password already updated' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Password reset token has expired' });
    }

    user.password = enterPassword; // Store password as plain text (not recommended)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};