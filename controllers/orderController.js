const Order = require("../models/Order");
const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError");

module.exports.getOrdersOfUser = wrapAsync(async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    throw new ExpressError(400, "User Id is required!");
  }

  const orders = await Order.find({ userId }).populate("items.dishId");
  res.json({ success: true, orders });
});

module.exports.placeOrder = wrapAsync(async (req, res) => {
  console.log("called");
  const { userId, items, totalAmount, paymentMethod, paymentStatus } = req.body;
  const newOrder = new Order({
    userId,
    items,
    totalAmount,
    paymentMethod,
    paymentStatus,
    status: "preparing",
  });

  await newOrder.save();
  res.status(201).json({ success: true, newOrder });
});
