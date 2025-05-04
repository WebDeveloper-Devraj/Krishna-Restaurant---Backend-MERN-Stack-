const Order = require("../../models/Order");
const User = require("../../models/User");
const SiteStat = require("../../models/SiteStat");
const wrapAsync = require("../../util/wrapAsync");

module.exports.getDashboardInfo = wrapAsync(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  const totalCustomers = await User.countDocuments({ role: "user" });
  const stat = await SiteStat.findOne();
  const siteVisits = stat?.totalVisits || 0;

  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalCustomers,
    siteVisits,
  });
});
