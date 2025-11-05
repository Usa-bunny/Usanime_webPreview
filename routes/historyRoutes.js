const express = require('express');
const router = express.Router();
const checkSession = require('../middleware/checkSession');
const historyController = require('../controllers/historyController');

router.get('/', checkSession, historyController.getHistory);
router.get('/add/:id', checkSession, historyController.addToHistory);

module.exports = router;
