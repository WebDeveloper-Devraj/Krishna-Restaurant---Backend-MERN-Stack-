const express = require("express");
const {
  getTestimonials,
  addTestimonial,
} = require("../controllers/testimonialController.js");
const { userVerification } = require("../middlewares/AuthMiddleware");

const router = express.Router();

router.get("/", getTestimonials);
router.post("/", userVerification, addTestimonial);

module.exports = router;
