// models/ContactMessage.js
const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required!"],
  },
  name: { type: String, required: [true, "user name is required!"] },
  message: { type: String, required: [true, "message is required!"] },
  createdAt: { type: Date, default: Date.now },
});

const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);
module.exports = ContactMessage;
