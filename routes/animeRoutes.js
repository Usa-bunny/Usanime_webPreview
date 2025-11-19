// routes/animeRoutes.js
const express = require('express');
const router = express.Router();
const animeController = require('../controllers/animeController');
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');
const uploadImage = require('../middleware/upload');

router.get('/', checkRole('user', 'admin'), animeController.getAllAnime);

router.get('/admin', checkRole('admin'), animeController.getAllAnimeAdmin);
router.get('/add', checkRole('admin'), checkSession, animeController.getAddAnime);
router.get('/edit/:id', checkRole('admin'), checkSession, animeController.getEditAnime);
router.get('/delete/:id', checkRole('admin'), checkSession, animeController.deleteAnime);
router.post('/add', checkRole('admin'), checkSession, uploadImage.single('cover'), animeController.addAnime);
router.post('/edit/:id', checkRole('admin'), checkSession, uploadImage.single('cover'), animeController.editAnime);

router.get('/wishlist', checkRole('user', 'admin'), checkSession, animeController.getWishlist);
router.get('/wishlist/:id', checkRole('user', 'admin'), checkSession, animeController.toggleWishlist);

router.get('/history', checkRole('user', 'admin'), checkSession, animeController.getHistory);
router.get('/history/add/:id', checkRole('user', 'admin'), checkSession, animeController.addToHistory);

router.get("/:id", checkRole('user', 'admin'), animeController.getDetailAnime);

module.exports = router;







