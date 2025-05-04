const express = require("express");
const router = express.Router();

const {
  getOrdersOfUser,
  placeOrder,
} = require("../controllers/orderController");

// Get all orders of a user
router.get("/:userId", getOrdersOfUser);

// Place an order
router.post("/", placeOrder);

module.exports = router;
