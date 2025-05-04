const express = require("express");
const router = express.Router();
const { adminMiddleware } = require("../../middlewares/adminMiddleware");
const adminDishController = require("../../controllers/admin/adminDishController");
const { userVerification } = require("../../middlewares/AuthMiddleware");
const upload = require("../../middlewares/upload");

router.get(
  "/",
  userVerification,
  adminMiddleware,
  adminDishController.getAllDishes
);
router.delete(
  "/:dishId",
  userVerification,
  adminMiddleware,
  adminDishController.deleteDish
);
router.post(
  "/add",
  userVerification,
  adminMiddleware,
  upload.single("image"),
  adminDishController.addNewDish
);
router.post(
  "/edit",
  userVerification,
  adminMiddleware,
  upload.single("image"),
  adminDishController.editDish
);

module.exports = router;
