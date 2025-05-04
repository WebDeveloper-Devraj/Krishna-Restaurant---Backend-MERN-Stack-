const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User Id is required!"],
  },
  name: { type: String, required: [true, "User name is required!"] },
  review: { type: String, required: [true, "review is required!"] },
  rating: { type: String, required: [true, "rating is required!"] },
});

const Testimonial = new mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;
