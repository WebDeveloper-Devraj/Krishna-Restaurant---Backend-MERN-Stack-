const mongoose = require("mongoose");

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    required: [true, "Dish name is required!"]
  },
  description: {
    type: String,
    required: [true, "Dish description is required!"]
  },
  price: {
    type: Number,
    required: [true, "Dish price is required!"]
  },
  image: {
    type: String,
    required: [true, "Dish image is required!"]
  },
  category: {
    type: String,
    required: [true, "Dish category is required!"]
  },
  ingredients: {
    type: [String],
    required: [true, "Ingredients are required!"]
  },
  featured: {
    type: Boolean,
    default: false,
    required: [true, "Choose featured as true or false!"]
  },
});

const Dish = new mongoose.model("Dish", dishSchema);

module.exports = Dish;
