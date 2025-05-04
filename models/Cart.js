const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required!"],
    unique: true,
  },
  items: [
    {
      dishId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish",
        required: [true, "Dish Id is required!"],
      },
      quantity: {
        type: Number,
        default: 1,
        required: [true, "Quantity is required!"],
      },
    },
  ],
});

const Cart = new mongoose.model("Cart", cartSchema);

module.exports = Cart;
