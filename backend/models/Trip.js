const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Trip title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    name: { type: String, required: true },
    country: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    placeId: { type: String, default: '' }
  },
  dates: {
    start: { type: Date, required: true },
    end: { type: Date, required: true }
  },
  budget: {
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    spent: { type: Number, default: 0 },
    breakdown: {
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      miscellaneous: { type: Number, default: 0 }
    }
  },
  status: {
    type: String,
    enum: ['planning', 'upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  coverImage: { type: String, default: '' },
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false },
  weatherData: {
    cached: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed },
    lastFetched: { type: Date }
  },
  analytics: {
    totalPlaces: { type: Number, default: 0 },
    totalDays: { type: Number, default: 0 },
    categoriesVisited: [{ type: String }]
  }
}, { timestamps: true });

// Virtual for duration
tripSchema.virtual('duration').get(function() {
  if (this.dates.start && this.dates.end) {
    return Math.ceil((this.dates.end - this.dates.start) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Trip', tripSchema);
