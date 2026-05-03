const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Collaborator = require('../models/Collaborator');

exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const trips = await Trip.find({ owner: userId });
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'completed').length;
    const upcomingTrips = trips.filter(t => t.status === 'upcoming' || t.status === 'planning').length;
    const totalBudget = trips.reduce((sum, t) => sum + (t.budget?.total || 0), 0);
    const totalSpent = trips.reduce((sum, t) => sum + (t.budget?.spent || 0), 0);

    // Category breakdown
    const allCategories = trips.flatMap(t => t.analytics?.categoriesVisited || []);
    const categoryCount = {};
    allCategories.forEach(c => { categoryCount[c] = (categoryCount[c] || 0) + 1; });
    const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

    // Destinations
    const destinations = trips.map(t => ({ name: t.destination.name, status: t.status, budget: t.budget?.total }));

    // Monthly trips
    const monthlyData = {};
    trips.forEach(t => {
      const month = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });

    const collaboratedTrips = await Collaborator.countDocuments({ user: userId, status: 'accepted' });

    res.json({
      summary: { totalTrips, completedTrips, upcomingTrips, collaboratedTrips, totalBudget, totalSpent, budgetUtilization: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0 },
      topCategories,
      destinations,
      monthlyData: Object.entries(monthlyData).map(([month, count]) => ({ month, count }))
    });
  } catch (err) { next(err); }
};
