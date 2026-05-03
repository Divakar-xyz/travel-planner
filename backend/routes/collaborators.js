const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/collaboratorController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/:tripId', ctrl.getCollaborators);
router.post('/:tripId/invite', ctrl.invite);
router.put('/:tripId/accept', ctrl.acceptInvite);
router.delete('/:tripId/:userId', ctrl.removeCollaborator);

module.exports = router;
