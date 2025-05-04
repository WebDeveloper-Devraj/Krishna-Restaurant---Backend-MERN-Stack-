const Order = require("../../models/Order");
const ExpressError = require("../../util/ExpressError");
const wrapAsync = require("../../util/wrapAsync");

module.exports.getAllOrders = wrapAsync(async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "username") // Get customer name
    .populate("items.dishId", "name"); // Get dish name;

  res.status(200).json({ success: true, orders });
});

module.exports.updateOrderStatus = wrapAsync(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true }
  );

  if (!updatedOrder) {
    throw new ExpressError(404, "Order Not Found!");
  }

  res
    .status(200)
    .json({ success: true, message: "Order status updated", updatedOrder });
});

module.exports.updatePaymentStatus = wrapAsync(async (req, res) => {
  const { orderId } = req.params;
  const { paymentStatus } = req.body;

  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { paymentStatus },
    { new: true }
  );

  if (!updatedOrder) {
    throw new ExpressError(404, "Order Not Found!");
  }

  res.status(200).json({ success: true, order: updatedOrder });
});

module.exports.getRecentOrders = wrapAsync(async (req, res) => {
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 }) // Latest orders first
    .limit(5)
    .populate("userId", "username") // Get customer name
    .populate("items.dishId", "name"); // Get dish name

  res.status(200).json(recentOrders);
});

