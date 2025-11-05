const mongoose = require("mongoose");

const animeSchema = new mongoose.Schema({
    cover: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    genre: {
        type: [String],
        required: true
    },
    synopsis: {
        type: String,
        required: true
    },
    episodes: {
        type: Number,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Anime", animeSchema);