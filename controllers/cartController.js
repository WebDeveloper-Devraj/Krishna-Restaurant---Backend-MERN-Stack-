const Cart = require("../models/Cart");
const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError");

module.exports.getUserCart = wrapAsync(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId }).populate(
    "items.dishId"
  );

  if (!cart) {
    throw new ExpressError(404, "Cart Not Found!");
  }
  res.json({ success: true, cart });
});

module.exports.addItemToCart = wrapAsync(async (req, res) => {
  const { userId, dishId, quantity } = req.body;
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [{ dishId, quantity }] });
  } else {
    cart.items.push({ dishId, quantity });
  }
  await cart.save();
  res.status(200).json({ success: true, cart });
});

module.exports.updateItemQuantity = wrapAsync(async (req, res) => {
  const { userId, dishId, quantity } = req.body;
  if (!userId) {
    throw new ExpressError(400, "User Id is required!");
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ExpressError(404, "Cart Not Found!");
  }

  const item = cart.items.find((item) => item.dishId.toString() === dishId);
  item.quantity = quantity;
  await cart.save();

  res.status(200).json({ success: true, cart });
});

module.exports.removeItem = wrapAsync(async (req, res) => {
  const { userId, dishId } = req.body;
  if (!userId) {
    throw new ExpressError(400, "User Id is required!");
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ExpressError(404, "Cart Not Found!");
  }

  cart.items = cart.items.filter((item) => item.dishId.toString() !== dishId);

  await cart.save();
  res.status(200).json({ success: true, cart });
});

module.exports.removeMultipleItems = wrapAsync(async (req, res) => {
  const { userId, dishIds } = req.body;
  if (!userId || !dishIds) {
    throw new ExpressError(400, "Both User Id and Dish Ids are required!");
  }
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    throw new ExpressError(404, "Cart Not Found!");
  }

  cart.items = cart.items.filter(
    (item) => !dishIds.includes(item.dishId.toString())
  );
  await cart.save();

  res.status(200).json({ success: true, cart });
});

module.exports.mergeGuestCart = wrapAsync(async (req, res) => {
  const { userId, guestCart } = req.body;
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: guestCart });
  } else {
    if (!guestCart) {
      throw new ExpressError(400, "Guest cart is required!");
    }

    guestCart.forEach((guestItem) => {
      const existingItem = cart.items.find(
        (item) => item.dishId._id.toString() === guestItem.dishId._id.toString()
      );
      if (existingItem) {
        existingItem.quantity += guestItem.quantity;
      } else {
        cart.items.push(guestItem);
      }
    });
  }

  await cart.save();
  res.status(200).json({ success: true, cart });
});
