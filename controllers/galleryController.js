const GalleryItem = require("../models/GalleryItem");
const wrapAsync = require("../util/wrapAsync");

exports.getAllGalleryItems = wrapAsync(async (req, res) => {
  const items = await GalleryItem.find();
  res.json({ success: true, items });
});
