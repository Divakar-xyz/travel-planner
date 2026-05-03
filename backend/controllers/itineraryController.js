const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');
const Collaborator = require('../models/Collaborator');
const { generateItinerary, replanDay } = require('../services/itineraryEngine');
const { fetchLocations } = require('../services/locationService');
const { getWeatherForecast } = require('../services/weatherService');

const canAccess = async (tripId, userId, requireEditor = false) => {
  const trip = await Trip.findById(tripId);
  if (!trip) return { ok: false, error: 'Trip not found', status: 404 };
  const isOwner = trip.owner.toString() === userId.toString();
  if (isOwner) return { ok: true, trip };
  const collab = await Collaborator.findOne({ trip: tripId, user: userId, status: 'accepted' });
  if (!collab) return { ok: false, error: 'Access denied', status: 403 };
  if (requireEditor && collab.role !== 'editor') return { ok: false, error: 'Editor access required', status: 403 };
  return { ok: true, trip };
};

exports.getItinerary = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const access = await canAccess(tripId, req.user._id);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    let itinerary = await Itinerary.findOne({ trip: tripId });
    if (!itinerary) itinerary = await Itinerary.create({ trip: tripId, days: [] });
    res.json({ itinerary });
  } catch (err) { next(err); }
};

exports.generateItinerary = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { categories = ['tourism', 'restaurant', 'park'], useHiddenGems = false, pacePreference = 'moderate' } = req.body;
    const access = await canAccess(tripId, req.user._id, true);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const trip = access.trip;

    // Fetch locations from OSM
    const places = await fetchLocations(
      trip.destination.coordinates.lat,
      trip.destination.coordinates.lng,
      categories,
      8000
    );

    if (places.length === 0) return res.status(404).json({ error: 'No places found for this destination' });

    // Get weather
    const { forecast } = await getWeatherForecast(
      trip.destination.coordinates.lat,
      trip.destination.coordinates.lng,
      7
    );

    const preferences = {
      startTime: '09:00',
      endTime: '21:00',
      breakDuration: 60,
      pacePreference,
      useHiddenGems
    };

    const generatedDays = generateItinerary(places, trip.dates, preferences, forecast?.[0] || null);

    let itinerary = await Itinerary.findOne({ trip: tripId });
    if (!itinerary) {
      itinerary = new Itinerary({ trip: tripId });
    }
    itinerary.days = generatedDays;
    itinerary.preferences = preferences;
    itinerary.generatedAt = new Date();
    itinerary.lastModified = new Date();
    itinerary.version += 1;
    await itinerary.save();

    // Update trip analytics
    const totalPlaces = generatedDays.reduce((sum, d) => sum + d.places.length, 0);
    const categories_visited = [...new Set(generatedDays.flatMap(d => d.places.map(p => p.category)))];
    await Trip.findByIdAndUpdate(tripId, {
      'analytics.totalPlaces': totalPlaces,
      'analytics.totalDays': generatedDays.length,
      'analytics.categoriesVisited': categories_visited
    });

    res.json({ itinerary, weatherForecast: forecast });
  } catch (err) { next(err); }
};

exports.updateDay = async (req, res, next) => {
  try {
    const { tripId, dayNumber } = req.params;
    const access = await canAccess(tripId, req.user._id, true);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const itinerary = await Itinerary.findOne({ trip: tripId });
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    const dayIdx = itinerary.days.findIndex(d => d.dayNumber === parseInt(dayNumber));
    if (dayIdx === -1) return res.status(404).json({ error: 'Day not found' });
    const { notes, places } = req.body;
    if (notes !== undefined) itinerary.days[dayIdx].notes = notes;
    if (places !== undefined) itinerary.days[dayIdx].places = places;
    itinerary.lastModified = new Date();
    itinerary.markModified('days');
    await itinerary.save();
    res.json({ day: itinerary.days[dayIdx] });
  } catch (err) { next(err); }
};

exports.replanDay = async (req, res, next) => {
  try {
    const { tripId, dayNumber } = req.params;
    const { removedPlaceId } = req.body;
    const access = await canAccess(tripId, req.user._id, true);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const itinerary = await Itinerary.findOne({ trip: tripId });
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    const dayIdx = itinerary.days.findIndex(d => d.dayNumber === parseInt(dayNumber));
    if (dayIdx === -1) return res.status(404).json({ error: 'Day not found' });
    const updatedDay = replanDay(itinerary.days[dayIdx].toObject(), removedPlaceId, itinerary.preferences);
    itinerary.days[dayIdx] = updatedDay;
    itinerary.lastModified = new Date();
    itinerary.markModified('days');
    await itinerary.save();
    res.json({ day: itinerary.days[dayIdx] });
  } catch (err) { next(err); }
};

exports.addPlace = async (req, res, next) => {
  try {
    const { tripId, dayNumber } = req.params;
    const access = await canAccess(tripId, req.user._id, true);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const itinerary = await Itinerary.findOne({ trip: tripId });
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });
    const dayIdx = itinerary.days.findIndex(d => d.dayNumber === parseInt(dayNumber));
    if (dayIdx === -1) return res.status(404).json({ error: 'Day not found' });
    itinerary.days[dayIdx].places.push(req.body);
    itinerary.lastModified = new Date();
    itinerary.markModified('days');
    await itinerary.save();
    res.json({ day: itinerary.days[dayIdx] });
  } catch (err) { next(err); }
};

exports.removePlace = async (req, res, next) => {
  try {
    const { tripId, dayNumber, placeId } = req.params;
    const access = await canAccess(tripId, req.user._id, true);
    if (!access.ok) return res.status(access.status).json({ error: access.error });
    const itinerary = await Itinerary.findOne({ trip: tripId });
    const dayIdx = itinerary.days.findIndex(d => d.dayNumber === parseInt(dayNumber));
    if (dayIdx === -1) return res.status(404).json({ error: 'Day not found' });
    itinerary.days[dayIdx].places = itinerary.days[dayIdx].places.filter(p => p._id.toString() !== placeId);
    itinerary.lastModified = new Date();
    itinerary.markModified('days');
    await itinerary.save();
    res.json({ day: itinerary.days[dayIdx] });
  } catch (err) { next(err); }
};
