const express = require("express");
const { getMembers, addMember } = require("../controllers/memberController.js");

const router = express.Router();

router.get("/", getMembers);

module.exports = router;
