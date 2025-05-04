// middlewares/upload.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../util/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "restaurant_media", // Folder name in Cloudinary
    allowedFormats : ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;
