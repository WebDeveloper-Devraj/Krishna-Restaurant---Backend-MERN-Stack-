const express = require("express");
const {
  countVisit,
  getCountVisit,
} = require("../controllers/trackVisitController");

const router = express.Router();

router.post("/track-visit", countVisit);

router.get("/site-visits", getCountVisit);

module.exports = router;
