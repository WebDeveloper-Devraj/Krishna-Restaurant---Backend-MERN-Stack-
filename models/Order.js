const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required!"],
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
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required!"],
    },
    status: {
      type: String,
      enum: ["preparing", "completed", "delivered", "cancelled"],
      default: "preparing",
    },
    ETA: {
      type: Number,
      default: 15,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: [true, "Paymnet method is required!"],
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      required: [true, "Provide a valid payment status!"],
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    paymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
