const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Collaborator = require('../models/Collaborator');
const { estimateBudget } = require('../services/budgetEngine');

exports.createTrip = async (req, res, next) => {
  try {
    const tripData = { ...req.body, owner: req.user._id };
    const trip = await Trip.create(tripData);
    // Auto-create empty itinerary
    await Itinerary.create({ trip: trip._id, days: [] });
    res.status(201).json({ trip });
  } catch (err) { next(err); }
};

exports.getTrips = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;

    // Also get trips where user is collaborator
    const collabTrips = await Collaborator.find({ user: req.user._id, status: 'accepted' }).select('trip');
    const collabTripIds = collabTrips.map(c => c.trip);

    const trips = await Trip.find({ $or: [query, { _id: { $in: collabTripIds } }] })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'name avatar');

    const total = await Trip.countDocuments({ $or: [query, { _id: { $in: collabTripIds } }] });
    res.json({ trips, total, pages: Math.ceil(total / limit), page: parseInt(page) });
  } catch (err) { next(err); }
};

exports.getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('owner', 'name email avatar');
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const isOwner = trip.owner._id.toString() === req.user._id.toString();
    const collab = await Collaborator.findOne({ trip: trip._id, user: req.user._id, status: 'accepted' });
    if (!isOwner && !collab && !trip.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const collaborators = await Collaborator.find({ trip: trip._id }).populate('user', 'name email avatar');
    const budgetEstimate = estimateBudget(trip, req.user.preferences?.budgetRange);
    res.json({ trip, collaborators, budgetEstimate, userRole: isOwner ? 'owner' : collab?.role });
  } catch (err) { next(err); }
};

exports.updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.owner.toString() !== req.user._id.toString()) {
      const collab = await Collaborator.findOne({ trip: trip._id, user: req.user._id, role: 'editor', status: 'accepted' });
      if (!collab) return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ trip: updated });
  } catch (err) { next(err); }
};

exports.deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    if (trip.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Not authorized' });
    await Itinerary.deleteOne({ trip: trip._id });
    await Collaborator.deleteMany({ trip: trip._id });
    await trip.deleteOne();
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) { next(err); }
};

exports.getBudgetEstimate = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const estimate = estimateBudget(trip, req.user.preferences?.budgetRange || 'mid-range');
    res.json({ estimate });
  } catch (err) { next(err); }
};
