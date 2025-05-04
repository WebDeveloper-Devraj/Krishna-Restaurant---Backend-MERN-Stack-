const Testimonial = require("../models/Testimonial");
const wrapAsync = require("../util/wrapAsync");

// Get all testimonials
module.exports.getTestimonials = wrapAsync(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ _id: -1 });
  res.json({ success: true, testimonials });
});

// Add a new testimonial
module.exports.addTestimonial = wrapAsync(async (req, res) => {
  const { userId, name, review, rating } = req.body;
  const newTestimonial = new Testimonial({ userId, name, review, rating });
  await newTestimonial.save();
  res.status(201).json({ success: true, newTestimonial });
});
