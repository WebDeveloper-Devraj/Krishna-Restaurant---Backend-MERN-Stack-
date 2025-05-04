const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/galleryController");

router.get("/", galleryController.getAllGalleryItems);

module.exports = router;
