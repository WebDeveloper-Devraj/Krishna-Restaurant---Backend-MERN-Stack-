const Cart = require("../models/Cart");
const Order = require("../models/Order");
const User = require("../models/User");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError");

// jwt configuration
module.exports.signup = wrapAsync(async (req, res, next) => {
  const { username, email, password, phoneNo, createdAt } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ExpressError(400, "User already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    phoneNo,
    createdAt,
  });

  // 3. Create an empty cart for this user
  const cart = new Cart({
    userId: user._id,
    items: [],
  });
  await cart.save();

  const token = createSecretToken(user._id);
  res.cookie("token", token, {
    withCredentials: true,
    httpOnly: true,
  });

  res
    .status(201)
    .json({ message: "Welcome to Krishna Restaurant!", success: true, user });
});

module.exports.login = wrapAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ExpressError(400, "All fields are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new ExpressError(400, "Incorrect email! please enter correct email.");
  }

  const auth = await bcrypt.compare(password, user.password);
  if (!auth) {
    throw new ExpressError(
      400,
      "Incorrect password! please enter correct password."
    );
  }

  const token = createSecretToken(user._id);
  res.cookie("token", token, {
    withCredentials: true,
    httpOnly: true,
  });

  res.status(201).json({
    message: "Welcome back to Krishna Restaurant!",
    success: true,
    user: user,
  });
});

module.exports.logout = wrapAsync((req, res, next) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: false, // true if you're using HTTPS
  });

  res.status(200).json({ message: "Logged out successfully", success: true });
});

module.exports.updateUserProfile = wrapAsync(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  console.log(req.body);
  console.log("user password: ", user.password);

  const { name, phoneNo, currentPassword, newPassword } = req.body;

  if (currentPassword && newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log("is match: ", isMatch);
    if (!isMatch) {
      throw new ExpressError(400, "current password is incorrect!");
    }

    user.password = newPassword;
  }

  user.phoneNo = phoneNo;
  user.username = name;

  await user.save();

  return res.json({
    message: "Profile updated successfully",
    success: true,
    user,
  });
});

module.exports.deleteUser = wrapAsync(async (req, res) => {
  const userId = req.user._id;
  const { password } = req.body;

  if (!password) {
    throw new ExpressError(400, "password is required!");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ExpressError(404, "User Not Found!");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ExpressError(401, "Incorrect password!");
  }

  await Cart.deleteOne({ userId });
  await Order.deleteMany({ userId });

  await User.findByIdAndDelete(userId);

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "LAX",
    secure: true,
  });

  return res.json({ success: true, message: "Account deleted successfully!" });
});
