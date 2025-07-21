const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, text, html = null) => {
  try {
    await transporter.sendMail({
      from: `"GeoReport" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      ...(html && { html }),
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
// This module exports a function to send emails using nodemailer.
// It uses environment variables for SMTP configuration.