const express = require("express");
const router = express.Router();
const { adminMiddleware } = require("../../middlewares/adminMiddleware");
const { userVerification } = require("../../middlewares/AuthMiddleware");

const {
  getAllOrders,
  updateOrderStatus,
  getRecentOrders,
  updatePaymentStatus,
} = require("../../controllers/admin/adminOrderController");

router.get("/", userVerification, adminMiddleware, getAllOrders);

router.put(
  "/update-status/:orderId",
  userVerification,
  adminMiddleware,
  updateOrderStatus
);

router.put(
  "/update-payment/:orderId",
  userVerification,
  adminMiddleware,
  updatePaymentStatus
);

router.get(
  "/recent-orders",
  userVerification,
  adminMiddleware,
  getRecentOrders
);

module.exports = router;
