/**
 * Budget Estimation Engine
 * Uses predefined cost datasets per region/city type
 */

// Cost data per city tier (USD per day per person)
const CITY_COST_DATA = {
  'tier1': { // Major expensive cities: NYC, London, Tokyo, Paris, Sydney
    hotel: { budget: 80, 'mid-range': 180, luxury: 400 },
    food: { budget: 25, 'mid-range': 60, luxury: 150 },
    transport: { budget: 10, 'mid-range': 20, luxury: 50 },
    activities: { budget: 15, 'mid-range': 40, luxury: 100 }
  },
  'tier2': { // Mid-tier: Barcelona, Bangkok, Dubai, Singapore
    hotel: { budget: 50, 'mid-range': 120, luxury: 300 },
    food: { budget: 15, 'mid-range': 40, luxury: 100 },
    transport: { budget: 8, 'mid-range': 15, luxury: 35 },
    activities: { budget: 10, 'mid-range': 30, luxury: 80 }
  },
  'tier3': { // Budget destinations: Bali, Vietnam, India, Eastern Europe
    hotel: { budget: 20, 'mid-range': 60, luxury: 150 },
    food: { budget: 8, 'mid-range': 20, luxury: 60 },
    transport: { budget: 5, 'mid-range': 10, luxury: 25 },
    activities: { budget: 5, 'mid-range': 15, luxury: 40 }
  }
};

const TIER1_CITIES = ['new york', 'london', 'tokyo', 'paris', 'sydney', 'zurich', 'san francisco', 'oslo', 'copenhagen', 'hong kong', 'singapore'];
const TIER3_CITIES = ['bali', 'hanoi', 'ho chi minh', 'bangkok', 'delhi', 'mumbai', 'cairo', 'bucharest', 'sofia', 'kathmandu'];

const getCityTier = (destinationName) => {
  const name = (destinationName || '').toLowerCase();
  if (TIER1_CITIES.some(city => name.includes(city))) return 'tier1';
  if (TIER3_CITIES.some(city => name.includes(city))) return 'tier3';
  return 'tier2';
};

const estimateBudget = (trip, userBudgetPreference = 'mid-range') => {
  const { destination, dates, budget } = trip;
  
  const start = new Date(dates.start);
  const end = new Date(dates.end);
  const numDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  
  const tier = getCityTier(destination.name);
  const costs = CITY_COST_DATA[tier][userBudgetPreference] || CITY_COST_DATA['tier2']['mid-range'];

  const breakdown = {
    accommodation: Math.round(costs.hotel * numDays),
    food: Math.round(costs.food * numDays),
    transport: Math.round(costs.transport * numDays),
    activities: Math.round(costs.activities * numDays),
    miscellaneous: Math.round((costs.hotel + costs.food) * numDays * 0.1)
  };

  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const userBudget = budget?.total || 0;
  const isOverBudget = userBudget > 0 && total > userBudget;
  const budgetDifference = userBudget - total;

  const warnings = [];
  if (isOverBudget) {
    warnings.push(`Estimated cost ($${total}) exceeds your budget ($${userBudget}) by $${Math.abs(budgetDifference)}`);
  }
  if (breakdown.accommodation > total * 0.5) {
    warnings.push('Accommodation costs are high. Consider hostels or vacation rentals.');
  }
  if (numDays > 14) {
    warnings.push('Long trip detected. Consider transport passes for savings.');
  }

  const suggestions = [];
  if (isOverBudget) {
    if (userBudgetPreference === 'luxury') suggestions.push('Switch to mid-range options to save ~40%');
    if (userBudgetPreference === 'mid-range') suggestions.push('Switch to budget options to save ~50%');
    suggestions.push('Book accommodations in advance for better rates');
    suggestions.push('Use public transport instead of taxis');
  }

  return {
    estimatedTotal: total,
    userBudget,
    isOverBudget,
    budgetDifference,
    breakdown,
    perDayCost: Math.round(total / numDays),
    numDays,
    cityTier: tier,
    warnings,
    suggestions,
    percentageUsed: userBudget > 0 ? Math.round((total / userBudget) * 100) : 0
  };
};

const updateBudgetSpent = (breakdown) => {
  return Object.values(breakdown).reduce((a, b) => a + (b || 0), 0);
};

module.exports = { estimateBudget, getCityTier, updateBudgetSpent };
