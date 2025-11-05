const History = require('../models/historyModel');
const Anime = require('../models/animeModel');

module.exports = {
  // Menambahkan ke riwayat nonton
    addToHistory: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).send("Anda harus login untuk menambahkan ke riwayat.");
            }

            const userId = req.session.user.id || req.session.user._id;
            console.log("User ID digunakan:", userId);
            const animeId = req.params.id;

            const anime = await Anime.findById(animeId);
            if (!anime) {
                return res.status(404).send("Anime tidak ditemukan.");
            }

            let history = await History.findOne({ user_id: userId, anime_id: animeId });

            if (!history) {
                history = new History({
                    user_id: userId,
                    anime_id: animeId,
                    watched_at: new Date(),
                    status: 'watching'
                });
                await history.save();
            } else {
                history.watched_at = new Date();
                await history.save();
            }
        return res.redirect(anime.link);
        } catch (error) {
            console.error("Error adding to history:", error);
            res.status(500).send("Terjadi kesalahan saat menambahkan ke riwayat.");
        }
    },

    getHistory: async (req, res) => {
        try {
            const userId = req.session.user.id; // atau _id tergantung session
            console.log("🔍 Memuat riwayat untuk user:", userId);

            const historyList = await History.find({ user_id: userId })
            .populate('anime_id')
            .sort({ watched_at: -1 });

            console.log("📜 Data history ditemukan:", historyList.length);

            res.render('history', { historyList });
        } catch (error) {
            console.error("Error fetching history:", error);
            res.status(500).send("Gagal mengambil riwayat tontonan.");
        }
    }
};
