const SiteStat = require("../models/SiteStat");

module.exports.trackVisits = async (req, res, next) => {
  try {
    let stat = await SiteStat.findOne();

    if (!stat) {
      stat = new SiteStat({ totalVisits: 1 });
    } else {
      stat.totalVisits += 1;
    }

    await stat.save();
  } catch (error) {
    console.log("Visit tracking error:", error.message);
  }

  next();
};
