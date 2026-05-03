const express = require('express');
const router = express.Router();
const { searchLocations, geocode } = require('../controllers/locationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/search', searchLocations);
router.get('/geocode', geocode);

module.exports = router;
