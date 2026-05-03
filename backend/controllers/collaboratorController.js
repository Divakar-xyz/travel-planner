const Collaborator = require('../models/Collaborator');
const User = require('../models/User');
const Trip = require('../models/Trip');
const crypto = require('crypto');

exports.invite = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { emailOrUsername, role = 'viewer' } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Only owner can invite' });
    const invitedUser = await User.findOne({ $or: [{ email: emailOrUsername }, { name: emailOrUsername }] });
    if (!invitedUser) return res.status(404).json({ error: 'User not found' });
    if (invitedUser._id.toString() === req.user._id.toString()) return res.status(400).json({ error: 'Cannot invite yourself' });
    const existing = await Collaborator.findOne({ trip: tripId, user: invitedUser._id });
    if (existing) return res.status(400).json({ error: 'User already invited' });
    const collab = await Collaborator.create({
      trip: tripId, user: invitedUser._id, role, invitedBy: req.user._id,
      inviteEmail: invitedUser.email, inviteToken: crypto.randomBytes(20).toString('hex')
    });
    res.status(201).json({ collaborator: collab, message: `Invitation sent to ${invitedUser.email}` });
  } catch (err) { next(err); }
};

exports.acceptInvite = async (req, res, next) => {
  try {
    const collab = await Collaborator.findOne({ trip: req.params.tripId, user: req.user._id });
    if (!collab) return res.status(404).json({ error: 'Invitation not found' });
    collab.status = 'accepted';
    await collab.save();
    res.json({ message: 'Invitation accepted', collaborator: collab });
  } catch (err) { next(err); }
};

exports.removeCollaborator = async (req, res, next) => {
  try {
    const { tripId, userId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Only owner can remove' });
    await Collaborator.deleteOne({ trip: tripId, user: userId });
    res.json({ message: 'Collaborator removed' });
  } catch (err) { next(err); }
};

exports.getCollaborators = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const isOwner = trip.owner.toString() === req.user._id.toString();
    const isCollab = await Collaborator.findOne({ trip: tripId, user: req.user._id, status: 'accepted' });
    if (!isOwner && !isCollab) return res.status(403).json({ error: 'Access denied' });
    const collaborators = await Collaborator.find({ trip: tripId }).populate('user', 'name email avatar');
    res.json({ collaborators });
  } catch (err) { next(err); }
};
