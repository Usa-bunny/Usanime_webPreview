const { get } = require('mongoose');
const Anime = require('../models/animeModel');
const Wishlist = require('../models/wishlistModel');
const path = require('path');
const fs = require('fs');

const animeController = {
    getAllAnime: async (req, res) => {
        try {
        const userId = req.session?.user?.id;
        const animeList = await Anime.find();

        const wishlist = await Wishlist.find({ user: userId }).select('anime');
        const wishlistIds = wishlist.map(w => w.anime.toString());

        res.render('listAnime', {
            animeList: animeList.map(anime => ({
            ...anime.toObject(),
            wishlist: wishlistIds.includes(anime._id.toString())
            }))
        });
        } catch (error) {
        console.error("Error fetching anime list:", error);
        res.status(500).send("Terjadi kesalahan saat memuat daftar anime.");
        }
    },

    getAllAnimeAdmin: async (req, res) => {
        try {
            const animeList = await Anime.find();
            res.render('listAnimeAdmin', { animeList });
        } catch (error) {
            console.error("Error fetching anime list:", error);
            res.status(500).send("an error occurred while fetching the anime list.");
        }
    },

    getAddAnime: (req, res) => {
        try {
            res.render('formAddAnime');
        } catch (error) {
            console.error("Error rendering add anime form:", error);
            res.status(500).send("an error occurred while loading the add anime form.");
        }
    },

    addAnime: async (req, res) => {
        try {
            const { title, rating, genre, synopsis, episodes, link } = req.body;
            const cover = req.file ? req.file.filename : null;
            const anime = new Anime({
                cover: cover,
                title: title,
                rating: rating,
                genre: genre,
                synopsis: synopsis,
                episodes: episodes,
                link: link
            });
            await anime.save();
            res.redirect('/anime');
        } catch (error) {
            console.error("Error adding new anime:", error);
            res.status(500).send("an error occurred while adding the new anime.");
        }
    },

    getEditAnime: async (req, res) => {
        try {
            const animeId = req.params.id;
            const anime = await Anime.findById(animeId);
            res.render('formEditAnime', { anime });
        } catch (error) {
            console.error("Error fetching anime details:", error);
            res.status(500).send("an error occurred while fetching anime details.");
        }
    },

    editAnime: async (req, res) => {
        try {
            const animeId = req.params.id;
            const { title, rating, genre, synopsis, episodes, link } = req.body;
            const cover = req.file ? req.file.filename : null;

            const anime = await Anime.findById(animeId);
            if (!anime) {
                return res.status(404).send("Anime not found.");
            }

            if (cover && anime.cover) {
                const oldCoverPath = path.join(__dirname, '../public/uploads', anime.cover);
                if (fs.existsSync(oldCoverPath)) {
                    fs.unlinkSync(oldCoverPath);
                }
            }

            anime.cover = cover || anime.cover;
            anime.title = title || anime.title;
            anime.rating = rating || anime.rating;
            anime.genre = genre || anime.genre;
            anime.synopsis = synopsis || anime.synopsis;
            anime.episodes = episodes || anime.episodes;
            anime.link = link || anime.link;

            await anime.save();
            res.redirect('/anime');
        } catch (error) {
            console.error("Error updating anime:", error);
            res.status(500).send("an error occurred while updating the anime.");
        }
    },

    deleteAnime: async (req, res) => {
        try {
            const animeId = req.params.id;
            const anime = await Anime.findById(animeId);

            if (!anime) {
                return res.status(404).send("Anime not found.");
            }

            if (anime.cover) {
                const coverPath = path.join(__dirname, '../public/uploads', anime.cover);
                if (fs.existsSync(coverPath)){
                    fs.unlinkSync(coverPath);
                }
            }

            await Anime.findByIdAndDelete(animeId);
            res.redirect('/anime');
        } catch (error) {
            console.error("Error deleting anime:", error);
            res.status(500).send("an error occurred while deleting the anime.");
        }
    },

    toggleWishlist: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const animeId = req.params.id;

            const existing = await Wishlist.findOne({ user: userId, anime: animeId });

            if (existing) {
                await Wishlist.findByIdAndDelete(existing._id);
            } else {
                const newWishlist = new Wishlist({ user: userId, anime: animeId });
                await newWishlist.save();
            }

            res.redirect('/anime');
        } catch (error) {
            console.error("Error updating wishlist:", error);
            res.status(500).send('Gagal mengubah wishlist.');
        }
    },

    getWishlist: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const wishlist = await Wishlist.find({ user: userId }).populate('anime');
            res.render('wishlist', { wishlist });
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            res.status(500).send('Gagal memuat wishlist.');
        }
    },
}

module.exports = animeController;