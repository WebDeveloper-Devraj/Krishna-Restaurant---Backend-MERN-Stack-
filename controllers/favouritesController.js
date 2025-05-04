const wrapAsync = require("../util/wrapAsync");
const ExpressError = require("../util/ExpressError");
const User = require("../models/User");

module.exports.getUserFavourites = wrapAsync(async (req, res) => {
  const userId = req.params.userId;
  const user = await User.findById(userId).populate("favourites");
  if (!user) {
    throw new ExpressError(404, "User Not Found!");
  }
  res.json({ success: true, favourites: user.favourites });
});

module.exports.toggleFavourite = wrapAsync(async (req, res) => {
  const { userId, dishId } = req.body;

  if (!dishId) {
    throw new ExpressError(400, "Dish Id is required!");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ExpressError(404, "User Not Found!");
  }

  const dishIndex = user.favourites.findIndex((id) => id.toString() === dishId);

  if (dishIndex > -1) {
    user.favourites.splice(dishIndex, 1); // Remove
  } else {
    user.favourites.push(dishId); // Add
  }

  await user.save();

  res
    .status(200)
    .json({ success: true, updatedFavouritesIds: user.favourites });
});
