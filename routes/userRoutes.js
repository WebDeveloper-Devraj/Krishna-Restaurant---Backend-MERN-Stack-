const express = require("express");
const router = express.Router();
const {
  logout,
  login,
  signup,
  updateUserProfile,
  deleteUser,
} = require("../controllers/userController");
const { userVerification } = require("../middlewares/AuthMiddleware");

// signup user
router.post("/signup", signup);

// login user
router.post("/login", login);

// logout user
router.get("/logout", logout);

router.put("/update", userVerification, updateUserProfile);

router.post("/delete", userVerification, deleteUser);

module.exports = router;
