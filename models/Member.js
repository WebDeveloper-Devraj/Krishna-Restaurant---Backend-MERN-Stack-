const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

const Member = new mongoose.model("Member", memberSchema);
module.exports = Member;
