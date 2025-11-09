const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    anime: { type: mongoose.Schema.Types.ObjectId, ref: "Anime", required: true },
    watched_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'watching', 'dropped', 'plan to watch'], default: "watching" }
});

module.exports = mongoose.model("History", historySchema);