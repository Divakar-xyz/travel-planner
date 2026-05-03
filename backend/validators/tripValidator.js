const Joi = require('joi');

const createTripSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional().allow(''),
  destination: Joi.object({
    name: Joi.string().required(),
    country: Joi.string().optional().allow(''),
    coordinates: Joi.object({
      lat: Joi.number().required(),
      lng: Joi.number().required()
    }).required(),
    placeId: Joi.string().optional().allow('')
  }).required(),
  dates: Joi.object({
    start: Joi.date().required(),
    end: Joi.date().greater(Joi.ref('start')).required()
  }).required(),
  budget: Joi.object({
    total: Joi.number().min(0).required(),
    currency: Joi.string().default('USD')
  }).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  isPublic: Joi.boolean().optional()
});

const updateTripSchema = Joi.object({
  title: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional().allow(''),
  destination: Joi.object({
    name: Joi.string(),
    country: Joi.string().allow(''),
    coordinates: Joi.object({ lat: Joi.number(), lng: Joi.number() }),
    placeId: Joi.string().allow('')
  }).optional(),
  dates: Joi.object({
    start: Joi.date(),
    end: Joi.date()
  }).optional(),
  budget: Joi.object({
    total: Joi.number().min(0),
    currency: Joi.string(),
    spent: Joi.number().min(0),
    breakdown: Joi.object({
      accommodation: Joi.number().min(0),
      food: Joi.number().min(0),
      transport: Joi.number().min(0),
      activities: Joi.number().min(0),
      miscellaneous: Joi.number().min(0)
    })
  }).optional(),
  status: Joi.string().valid('planning', 'upcoming', 'ongoing', 'completed', 'cancelled').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isPublic: Joi.boolean().optional()
});

module.exports = { createTripSchema, updateTripSchema };
