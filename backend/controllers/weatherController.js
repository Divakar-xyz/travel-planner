const { getWeatherForecast } = require('../services/weatherService');

exports.getWeather = async (req, res, next) => {
  try {
    const { lat, lng, days = 7 } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
    const weather = await getWeatherForecast(parseFloat(lat), parseFloat(lng), parseInt(days));
    res.json(weather);
  } catch (err) { next(err); }
};
