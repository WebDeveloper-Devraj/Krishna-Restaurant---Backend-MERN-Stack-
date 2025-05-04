const ExpressError = require("../util/ExpressError");

module.exports.adminMiddleware = async (req, res, next) => {
  const user = req.user;
  if (!user || user.role !== "admin") {
    next(new ExpressError(403, "Access denied. Admins only."));
  }

  next();
};
