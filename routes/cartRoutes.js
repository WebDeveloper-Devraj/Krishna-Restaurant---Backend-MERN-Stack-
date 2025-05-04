const express = require("express");
const router = express.Router();

const {
  getUserCart,
  addItemToCart,
  updateItemQuantity,
  removeItem,
  mergeGuestCart,
  removeMultipleItems,
} = require("../controllers/cartController");

// Get user's cart
router.get("/:userId", getUserCart);

// Add item to cart
router.post("/", addItemToCart);

// Update item quantity in cart
router.put("/update", updateItemQuantity);

// Remove item from cart
router.delete("/remove", removeItem);

router.delete("/remove-multiple", removeMultipleItems);

router.post("/merge", mergeGuestCart);

module.exports = router;
