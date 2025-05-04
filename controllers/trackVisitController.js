const SiteStat = require("../models/SiteStat");
const wrapAsync = require("../util/wrapAsync");

module.exports.countVisit = wrapAsync(async (req, res) => {
  let stat = await SiteStat.findOne();

  if (!stat) {
    stat = new SiteStat({ totalVisits: 1 });
  } else {
    stat.totalVisits += 1;
  }

  await stat.save();
  res.status(200).json({ success: true, message: "Visit counted" });
});

module.exports.getCountVisit = wrapAsync(async (req, res) => {
  const data = await SiteStat.findOne();
  const count = data ? data.totalVisits : 0;
  res.status(200).json({ success: true, visits: count });
});
