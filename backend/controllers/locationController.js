const { fetchLocations, geocodeAddress } = require('../services/locationService');

exports.searchLocations = async (req, res, next) => {
  try {
    const { lat, lng, categories, radius = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });
    const cats = categories ? categories.split(',') : ['tourism', 'restaurant', 'park'];
    const places = await fetchLocations(parseFloat(lat), parseFloat(lng), cats, parseInt(radius));
    res.json({ places, count: places.length });
  } catch (err) { next(err); }
};

exports.geocode = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
    const results = await geocodeAddress(q);
    res.json({ results });
  } catch (err) { next(err); }
};
