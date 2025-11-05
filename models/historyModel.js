const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    anime_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Anime',
        required: true
    },
    watched_at: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['completed', 'watching', 'dropped', 'plan to watch'],
        required: true,
        default: 'plan to watch'
    }
})

module.exports = mongoose.model("History", historySchema);