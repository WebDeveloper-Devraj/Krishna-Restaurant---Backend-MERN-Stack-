const mongoose = require("mongoose");

const galleryItemSchema = new mongoose.Schema({
  type: { type: String, enum: ["image", "video"], required: true },
  category: {
    type: String,
    enum: [
      "Ambiance & Interiors",
      "Food & Drinks",
      "Events & Celebrations",
      "Behind the Scenes",
    ],
    required: true,
  },
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("GalleryItem", galleryItemSchema);
