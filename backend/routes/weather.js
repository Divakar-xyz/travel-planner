const express = require('express');
const router = express.Router();
const { getWeather } = require('../controllers/weatherController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getWeather);

module.exports = router;
