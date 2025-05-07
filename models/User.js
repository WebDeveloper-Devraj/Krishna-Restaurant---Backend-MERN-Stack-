const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "Your username is required!"],
  },
  email: {
    type: String,
    required: [true, "Your email address is required!"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Your password is required!"],
  },
  phoneNo: {
    type: String,
    required: [true, "Your phone number is required!"],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  favourites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // 🔒 only hash if modified
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = new mongoose.model("User", userSchema);
