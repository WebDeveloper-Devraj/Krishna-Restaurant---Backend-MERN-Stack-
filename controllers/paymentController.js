const ExpressError = require("../util/ExpressError");
const wrapAsync = require("../util/wrapAsync");
const Order = require("../models/Order");
const Razorpay = require("razorpay");
const crypto = require("crypto");

module.exports.createRazorpayOrder = wrapAsync(async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    throw new ExpressError(400, "Amount is required!");
  }

  // Initialize Razorpay instance
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  const options = {
    amount: amount, // amount in smallest currency unit
    currency: "INR",
    receipt: "receipt_order_74394",
  };

  // Create order on Razorpay
  const order = await instance.orders.create(options);

  if (!order) {
    throw new ExpressError(500, "Some error occured");
  }

  // Format cart items for DB
  const orderItems = req.body.items.map((item) => ({
    dishId: item.dishId._id, // Only store the ObjectId
    quantity: item.quantity,
  }));

  // Save initial order to database
  const newOrder = new Order({
    userId: req.user._id,
    items: orderItems,
    totalAmount: req.body.amount / 100,
    status: "preparing",
    ETA: 15,
    paymentMethod: "online",
    paymentStatus: "unpaid",
    razorpayOrderId: order.id, // Razorpay order ID
    // paymentId: "null",
  });

  await newOrder.save();

  // Return Razorpay order details to frontend
  res.json({ success: true, order });
});

module.exports.razorpayPaymentSuccess = wrapAsync(async (req, res) => {
  const {
    orderCreationId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
  } = req.body;

  // Verify payment signature
  const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
  const digest = shasum.digest("hex");

  if (digest !== razorpaySignature) {
    throw new ExpressError(400, "Transaction not legit!");
  }

  // Update order status after successful payment verification
  const updatedOrder = await Order.findOneAndUpdate(
    { razorpayOrderId },
    {
      $set: {
        paymentStatus: "paid",
        paymentId: razorpayPaymentId,
        razorpaySignature,
      },
    },
    { new: true } // return the updated document
  );

  res.json({
    message: "Payment success, order updated",
    success: true,
    order: updatedOrder,
  });
});
