const axios = require('axios');

const getWeatherForecast = async (lat, lng, days = 7) => {
  try {
    const apiKey = process.env.OPEN_WEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_openweathermap_free_api_key') {
      return getMockWeather(days);
    }
    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: { lat, lon: lng, appid: apiKey, units: 'metric', cnt: Math.min(days * 8, 40) },
      timeout: 10000
    });
    const forecasts = response.data.list;
    const daily = {};
    forecasts.forEach(f => {
      const date = f.dt_txt.split(' ')[0];
      if (!daily[date]) {
        daily[date] = {
          date,
          temp: { min: f.main.temp_min, max: f.main.temp_max, avg: f.main.temp },
          condition: f.weather[0].main.toLowerCase(),
          description: f.weather[0].description,
          humidity: f.main.humidity,
          windSpeed: f.wind.speed,
          icon: f.weather[0].icon,
          isOutdoorFriendly: !['rain', 'storm', 'snow', 'thunderstorm'].includes(f.weather[0].main.toLowerCase())
        };
      }
    });
    return { success: true, forecast: Object.values(daily).slice(0, days), source: 'openweathermap' };
  } catch (err) {
    console.error('Weather API error:', err.message);
    return getMockWeather(days);
  }
};

const getMockWeather = (days = 7) => {
  const conditions = ['clear', 'clouds', 'rain', 'clear', 'clear', 'clouds', 'clear'];
  const forecast = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const condition = conditions[i % conditions.length];
    return {
      date: date.toISOString().split('T')[0],
      temp: { min: 18 + Math.random() * 5, max: 25 + Math.random() * 8, avg: 22 + Math.random() * 5 },
      condition,
      description: condition === 'clear' ? 'clear sky' : condition === 'rain' ? 'light rain' : 'partly cloudy',
      humidity: 50 + Math.floor(Math.random() * 30),
      windSpeed: 2 + Math.random() * 8,
      icon: condition === 'clear' ? '01d' : condition === 'rain' ? '10d' : '03d',
      isOutdoorFriendly: condition !== 'rain'
    };
  });
  return { success: true, forecast, source: 'mock' };
};

module.exports = { getWeatherForecast };
