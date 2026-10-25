const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmailOtp = async (email, otp) => {
  await transporter.sendMail({
    from: `"Hospital HMS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for HMS Verification',
    html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });
};

const sendSmsOtp = async (phone, otp) => {
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your HMS OTP is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE,
    to: phone,
  });
};

module.exports = { sendEmailOtp, sendSmsOtp };
