const Anime = require("../models/animeModel");
const Wishlist = require("../models/wishlistModel");
const History = require('../models/historyModel');
const cloudinary = require('../config/cloudinary')
const fs = require("fs");

const animeController = {

    getAllAnime: async (req, res) => {
        try {
            const userId = req.session?.user?._id;
            const animeList = await Anime.find();

            const wishlist = userId 
                ? await Wishlist.find({ user: userId }).select("anime")
                : [];

            const wishlistIds = wishlist.map(w => w.anime.toString());

            res.render("listAnime", {
                animeList: animeList.map(anime => ({
                    ...anime.toObject(),
                    wishlist: wishlistIds.includes(anime._id.toString())
                }))
            });

        } catch (error) {
            console.error(error);
            res.status(500).send("Error fetching anime list");
        }
    },

    getAllAnimeAdmin: async (req, res) => {
        try {
            const animeList = await Anime.find();
            res.render("listAnimeAdmin", { animeList });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error fetching anime list (admin)");
        }
    },

    getAddAnime: (req, res) => {
        res.render("formAddAnime");
    },

    addAnime: async (req, res) => {
        try {
            const { title, rating, genre, synopsis, episodes, link } = req.body;

            if (!req.file) {
                return res.status(400).send("File cover wajib diupload");
            }

            const upload = req.file; 

            await Anime.create({
                title,
                rating,
                genre,
                synopsis,
                episodes,
                link,
                cover: upload.path,       
                public_id: upload.filename 
            });

            res.redirect("/anime");
        } catch (error) {
            console.error(error);
            res.status(500).send("Error adding anime");
        }
    },

    getEditAnime: async (req, res) => {
        try {
            const anime = await Anime.findById(req.params.id);
            if (!anime) return res.status(404).send("Anime not found");
            res.render("formEditAnime", { anime });
        } catch (error) {
            console.error(error);
            res.status(500).send("Error loading anime");
        }
    },

    editAnime: async (req, res) => {
        try {
        const anime = await Anime.findById(req.params.id);
        if (!anime) return res.status(404).send("Anime not found");

        const { title, rating, genre, synopsis, episodes, link } = req.body;

        if (req.file) {
            if (anime.public_id) {
            await cloudinary.uploader.destroy(anime.public_id);
            }

            const upload = req.file;

            anime.cover = upload.path;
            anime.public_id = upload.filename;
        }

        anime.title = title;
        anime.rating = rating;
        anime.genre = genre;
        anime.synopsis = synopsis;
        anime.episodes = episodes;
        anime.link = link;

        await anime.save();
        res.redirect("/anime");
        } catch (error) {
        console.error(error);
        res.status(500).send("Error updating anime");
        }
    },


    deleteAnime: async (req, res) => {
        try {
            const anime = await Anime.findById(req.params.id);
            if (!anime) return res.status(404).send("Anime not found");

            if (anime.public_id) {
                await cloudinary.uploader.destroy(anime.public_id);
            }

            await Anime.findByIdAndDelete(req.params.id);
            res.redirect("/anime");

        } catch (error) {
            console.error(error);
            res.status(500).send("Error deleting anime");
        }
    },

    toggleWishlist: async (req, res) => {
        try {
            const userId = req.session?.user?._id;
            if (!userId) return res.redirect("/auth/login");

            const animeId = req.params.id;
            const exist = await Wishlist.findOne({ user: userId, anime: animeId });

            exist
                ? await Wishlist.deleteOne({ _id: exist._id })
                : await Wishlist.create({ user: userId, anime: animeId });

            res.redirect("/anime");

        } catch (error) {
            console.error(error);
            res.status(500).send("Wishlist update failed");
        }
    },

    getWishlist: async (req, res) => {
        try {
            const userId = req.session?.user?._id;
            const wishlist = await Wishlist.find({ user: userId })
                .populate("anime")
                .then(list => list.filter(item => item.anime)); 

            res.render("wishlist", { wishlist });
        } catch (error) {
            console.error(error);
            res.status(500).send("Failed to load wishlist");
        }
    },

    addToHistory: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).send("Harus login dulu boss 😭");
            }

            const userId = req.session.user._id;
            const animeId = req.params.id;

            const anime = await Anime.findById(animeId);
            if (!anime) return res.status(404).send("Anime ga ketemu 😭");

            let history = await History.findOne({ user: userId, anime: animeId });

            if (!history) {
                await History.create({
                    user: userId,
                    anime: animeId,
                    watched_at: new Date(),
                    status: "watching"
                });
            } else {
                history.watched_at = new Date();
                await history.save();
            }

            return res.redirect(anime.link);

        } catch (error) {
            console.error(error);
            res.status(500).send("Gagal update history");
        }
    },

    getHistory: async (req, res) => {
        try {
            const userId = req.session.user?._id;
            if (!userId) return res.redirect("/login");

            let historyList = await History.find({ user: userId })
                .populate("anime")
                .sort({ createdAt: -1 });

            // 🔧 Filter history yang anime-nya udah kehapus
            historyList = historyList.filter(item => item.anime !== null);

            res.render("history", {
                title: "Riwayat Tontonan",
                historyList,
            });
        } catch (err) {
            console.error(err);
            res.status(500).send("Terjadi kesalahan saat mengambil riwayat.");
        }
    }

};

module.exports = animeController;
