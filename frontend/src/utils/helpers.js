export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount || 0);
};

export const getDaysUntil = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getTripStatus = (trip) => {
  const now = new Date();
  const start = new Date(trip.dates?.start);
  const end = new Date(trip.dates?.end);
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
};

export const getCategoryIcon = (category) => {
  const icons = {
    museum: '🏛️', gallery: '🎨', park: '🌳', restaurant: '🍽️',
    cafe: '☕', attraction: '🗺️', viewpoint: '👁️', hotel: '🏨',
    bar: '🍺', pub: '🍺', shopping: '🛍️', beach: '🏖️',
    nature: '🌿', sports: '⚽', cinema: '🎬', mall: '🏬'
  };
  return icons[category] || '📍';
};

export const getWeatherIcon = (condition) => {
  const icons = {
    clear: '☀️', clouds: '⛅', rain: '🌧️', storm: '⛈️',
    snow: '❄️', fog: '🌫️', mist: '🌫️', drizzle: '🌦️'
  };
  return icons[condition?.toLowerCase()] || '🌤️';
};

export const getBudgetColor = (percentage) => {
  if (percentage < 70) return 'var(--green)';
  if (percentage < 90) return 'var(--amber)';
  return 'var(--red)';
};

export const truncate = (str, len = 60) =>
  str && str.length > len ? str.slice(0, len) + '...' : str || '';

export const getInitials = (name) =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';
