const express = require("express");
const router = express.Router();

const { adminMiddleware } = require("../../middlewares/adminMiddleware");
const { userVerification } = require("../../middlewares/AuthMiddleware");

const {
  getDashboardInfo,
} = require("../../controllers/admin/adminDashboardController");

router.get("/", userVerification, adminMiddleware, getDashboardInfo);

module.exports = router;
