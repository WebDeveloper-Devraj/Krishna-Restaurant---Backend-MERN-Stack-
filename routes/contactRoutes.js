require("dotenv").config();

const express = require("express");
const router = express.Router();
const ContactMessage = require("../models/ContactMessage");
const User = require("../models/User");
const transporter = require("../util/sendEmail"); // import transporter
const { userVerification } = require("../middlewares/AuthMiddleware");
const wrapAsync = require("../util/wrapAsync");

router.post(
  "/",
  userVerification,
  wrapAsync(async (req, res) => {
    const { name, message } = req.body;

    // Save to DB (optional)
    const newMessage = new ContactMessage({
      userId: req.user._id,
      name,
      message,
    });
    await newMessage.save();

    const user = await User.findById(req.user._id);

    // Send email to owner
    await transporter.sendMail({
      from: `"Contact Form" <${user.email}>`,
      to: process.env.OWNER_EMAIL, // restaurant owner's email
      subject: "New Message from Restaurant Website Contact Form",
      html: `
        <h3>New Message Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully" });
  })
);

module.exports = router;
