require("dotenv").config();
const express = require("express");
const { userVerification } = require("../middlewares/AuthMiddleware");

const {
  createRazorpayOrder,
  razorpayPaymentSuccess,
} = require("../controllers/paymentController");

const router = express.Router();

// Create Razorpay order and store initial order in DB
router.post("/orders", userVerification, createRazorpayOrder);

// Handle Razorpay payment success
router.post("/success", razorpayPaymentSuccess);

module.exports = router;
