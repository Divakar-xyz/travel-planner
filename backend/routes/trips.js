const express = require('express');
const router = express.Router();
const { createTrip, getTrips, getTrip, updateTrip, deleteTrip, getBudgetEstimate } = require('../controllers/tripController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTripSchema, updateTripSchema } = require('../validators/tripValidator');

router.use(protect);
router.get('/', getTrips);
router.post('/', validate(createTripSchema), createTrip);
router.get('/:id', getTrip);
router.put('/:id', validate(updateTripSchema), updateTrip);
router.delete('/:id', deleteTrip);
router.get('/:id/budget', getBudgetEstimate);

module.exports = router;
