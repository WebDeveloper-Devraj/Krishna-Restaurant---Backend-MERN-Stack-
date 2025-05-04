const Member = require("../models/Member.js");
const wrapAsync = require("../util/wrapAsync.js");

// Get all members
module.exports.getMembers = wrapAsync(async (req, res) => {
  const members = await Member.find().sort({ _id: 1 });
  res.json({success: true, members});
});

