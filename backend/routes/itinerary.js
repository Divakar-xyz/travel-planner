const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/:tripId', ctrl.getItinerary);
router.post('/:tripId/generate', ctrl.generateItinerary);
router.put('/:tripId/day/:dayNumber', ctrl.updateDay);
router.post('/:tripId/day/:dayNumber/replan', ctrl.replanDay);
router.post('/:tripId/day/:dayNumber/place', ctrl.addPlace);
router.delete('/:tripId/day/:dayNumber/place/:placeId', ctrl.removePlace);

module.exports = router;
