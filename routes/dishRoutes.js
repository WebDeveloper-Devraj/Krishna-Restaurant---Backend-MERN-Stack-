const express = require("express");
const router = express.Router();

const { getAllDish, getDishById } = require("../controllers/dishController");

router.route("/").get(getAllDish);

router.route("/:id").get(getDishById);

module.exports = router;
