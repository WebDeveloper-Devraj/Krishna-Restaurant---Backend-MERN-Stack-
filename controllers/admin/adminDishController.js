const Dish = require("../../models/Dish");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const wrapAsync = require("../../util/wrapAsync");
const ExpressError = require("../../util/ExpressError");

module.exports.getAllDishes = wrapAsync(async (req, res) => {
  const dishes = await Dish.find();
  res.json({ success: true, dishes });
});

module.exports.addNewDish = wrapAsync(async (req, res) => {
  const { name, description, price, category, ingredients, featured } =
    req.body;

  const imageUrl = req.file?.path;

  const newDish = new Dish({
    name,
    description,
    price,
    category,
    ingredients: ingredients.split(" "),
    featured,
    image: imageUrl || "testing_image",
  });

  await newDish.save();

  res
    .status(201)
    .json({ success: true, message: "Dish added successfully", dish: newDish });
});

module.exports.editDish = wrapAsync(async (req, res) => {
  const { dishId, name, description, price, category, ingredients, featured } =
    req.body;

  const imageUrl = req.file?.path;

  const dish = await Dish.findById(dishId);
  if (!dish) {
    throw new ExpressError(404, "Dish Not Found!");
  }

  // Update the fields
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image = imageUrl || "testing";
  dish.category = category;
  if (ingredients) {
    dish.ingredients = ingredients.split(",").map((item) => item.trim());
  }
  dish.featured = featured;

  // Save the updated dish
  await dish.save();

  res
    .status(200)
    .json({ success: true, message: "Dish updated successfully", dish });
});

module.exports.deleteDish = wrapAsync(async (req, res) => {
  let { dishId } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ExpressError(400, "You must provide a password");
  }

  const adminUser = await User.findById(req.user._id);

  const isMatch = await bcrypt.compare(password, adminUser.password);
  if (!isMatch) {
    throw new ExpressError(403, "Incorrect password");
  }

  const deletedDish = await Dish.findByIdAndDelete(dishId);
  if (!deletedDish) {
    throw new ExpressError(404, "Dish Not Found!");
  }

  res.status(200).json({ success: true, message: "Dish deleted successfully" });
});
