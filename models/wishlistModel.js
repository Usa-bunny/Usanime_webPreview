const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  anime: { type: mongoose.Schema.Types.ObjectId, ref: 'Anime', required: true },
  added_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
