import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

export const tripAPI = {
  getAll: (params) => api.get('/trips', { params }),
  getOne: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  getBudget: (id) => api.get(`/trips/${id}/budget`)
};

export const itineraryAPI = {
  get: (tripId) => api.get(`/itinerary/${tripId}`),
  generate: (tripId, data) => api.post(`/itinerary/${tripId}/generate`, data),
  updateDay: (tripId, dayNum, data) => api.put(`/itinerary/${tripId}/day/${dayNum}`, data),
  replanDay: (tripId, dayNum, data) => api.post(`/itinerary/${tripId}/day/${dayNum}/replan`, data),
  addPlace: (tripId, dayNum, data) => api.post(`/itinerary/${tripId}/day/${dayNum}/place`, data),
  removePlace: (tripId, dayNum, placeId) => api.delete(`/itinerary/${tripId}/day/${dayNum}/place/${placeId}`)
};

export const locationAPI = {
  search: (params) => api.get('/locations/search', { params }),
  geocode: (q) => api.get('/locations/geocode', { params: { q } })
};

export const weatherAPI = {
  get: (lat, lng, days) => api.get('/weather', { params: { lat, lng, days } })
};

export const collabAPI = {
  get: (tripId) => api.get(`/collaborators/${tripId}`),
  invite: (tripId, data) => api.post(`/collaborators/${tripId}/invite`, data),
  accept: (tripId) => api.put(`/collaborators/${tripId}/accept`),
  remove: (tripId, userId) => api.delete(`/collaborators/${tripId}/${userId}`)
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard')
};

export default api;
