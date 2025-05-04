// not yet used

// const User = require("../../models/User");

// exports.getAllUsers = async (req, res) => {
//   const users = await User.find().select("-password"); // Don't send password
//   res.status(200).json({ success: true, users });
// };

// module.exports.deleteUser = async (req, res) => {
//   const { userId } = req.params;
//   await User.findByIdAndDelete(userId);
//   res.status(200).json({ success: true, message: "User deleted successfully" });
// };
