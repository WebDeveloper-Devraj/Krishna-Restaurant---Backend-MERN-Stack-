const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.OWNER_EMAIL, // Your Gmail
    pass: process.env.OWNER_EMAIL_PASS, // App password (not your real password)
  },
});

module.exports = transporter;
