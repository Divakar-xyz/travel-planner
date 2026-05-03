const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'attraction' },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String, default: '' },
  description: { type: String, default: '' },
  osmId: { type: String, default: '' },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  visitDuration: { type: Number, default: 60 }, // minutes
  openingHours: { type: String, default: '' },
  tags: [{ type: String }],
  isHiddenGem: { type: Boolean, default: false },
  estimatedCost: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { _id: true });

const daySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  dayNumber: { type: Number, required: true },
  places: [placeSchema],
  notes: { type: String, default: '' },
  weather: { type: mongoose.Schema.Types.Mixed },
  estimatedDistance: { type: Number, default: 0 }, // km
  estimatedTravelTime: { type: Number, default: 0 }, // minutes
  totalEstimatedCost: { type: Number, default: 0 },
  route: [{
    lat: Number,
    lng: Number
  }]
}, { _id: true });

const itinerarySchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true,
    unique: true
  },
  days: [daySchema],
  generatedAt: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  preferences: {
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '21:00' },
    breakDuration: { type: Number, default: 60 },
    pacePreference: { type: String, enum: ['slow', 'moderate', 'fast'], default: 'moderate' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
