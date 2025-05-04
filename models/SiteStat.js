const mongoose = require("mongoose");

const siteStatSchema = new mongoose.Schema({
  totalVisits: {
    type: Number,
    default: 0,
  },
});

const SiteStat = mongoose.model("SiteStat", siteStatSchema);
module.exports = SiteStat;
