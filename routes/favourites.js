const express = require("express");
const router = express.Router();

const {
  getUserFavourites,
  toggleFavourite,
} = require("../controllers/favouritesController");

// Get favourites
router.get("/:userId", getUserFavourites);

// Toggle favourite dish
router.post("/toggle", toggleFavourite);

module.exports = router;
