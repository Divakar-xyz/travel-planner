const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  preferences: Joi.object({
    budgetRange: Joi.string().valid('budget', 'mid-range', 'luxury'),
    travelStyle: Joi.string().valid('adventure', 'cultural', 'relaxation', 'foodie', 'nature', 'urban'),
    interests: Joi.array().items(Joi.string())
  }).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };
