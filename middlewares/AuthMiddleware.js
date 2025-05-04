const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const ExpressError = require("../util/ExpressError");

module.exports.userVerification = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    throw new ExpressError(401, "User should be logged in!");
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      throw new ExpressError(401, "Invalid Token!");
    } else {
      try {
        const user = await User.findById(data.id);
        if (user) {
          req.user = user; // Attach user to the request object
          return next(); // Proceed to the next middleware or route handler
        } else {
          throw new ExpressError(401, "User Not Found!");
        }
      } catch (err) {
        next(err);
      }
    }
  });
};
