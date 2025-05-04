const Dish = require("../models/Dish");
const ExpressError = require("../util/ExpressError");
const wrapAsync = require("../util/wrapAsync");

module.exports.getAllDish = wrapAsync(async (req, res) => {
  const dishes = await Dish.find();
  res.status(200).json({ success: true, dishes });
});

module.exports.getDishById = wrapAsync(async (req, res) => {
  const dish = await Dish.findById(req.params.id);
  if (!dish) {
    throw new ExpressError(404, "Dish Not Found!");
  }

  res.json({ success: true, dish });
});
