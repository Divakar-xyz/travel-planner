const axios = require('axios');

// Overpass API query builder for OSM data
const buildOverpassQuery = (lat, lng, radiusMeters, categories) => {
  const categoryFilters = categories.map(cat => {
    const filters = {
      tourism: `node["tourism"](around:${radiusMeters},${lat},${lng});way["tourism"](around:${radiusMeters},${lat},${lng});`,
      restaurant: `node["amenity"="restaurant"](around:${radiusMeters},${lat},${lng});node["amenity"="cafe"](around:${radiusMeters},${lat},${lng});`,
      park: `node["leisure"="park"](around:${radiusMeters},${lat},${lng});way["leisure"="park"](around:${radiusMeters},${lat},${lng});`,
      museum: `node["tourism"="museum"](around:${radiusMeters},${lat},${lng});`,
      hotel: `node["tourism"="hotel"](around:${radiusMeters},${lat},${lng});`,
      attraction: `node["tourism"="attraction"](around:${radiusMeters},${lat},${lng});node["tourism"="viewpoint"](around:${radiusMeters},${lat},${lng});`,
      shopping: `node["shop"](around:${radiusMeters},${lat},${lng});way["shop"](around:${radiusMeters},${lat},${lng});`,
      nightlife: `node["amenity"="bar"](around:${radiusMeters},${lat},${lng});node["amenity"="pub"](around:${radiusMeters},${lat},${lng});`
    };
    return filters[cat] || filters['tourism'];
  }).join('');

  return `[out:json][timeout:25];(${categoryFilters});out body center;`;
};

const parseOSMResult = (element) => {
  const tags = element.tags || {};
  const lat = element.lat || element.center?.lat;
  const lng = element.lon || element.center?.lon;

  if (!lat || !lng) return null;

  const name = tags.name || tags['name:en'] || 'Unknown Place';
  if (!tags.name) return null;

  const category = tags.tourism || tags.amenity || tags.leisure || tags.shop || 'attraction';
  
  // Estimate visit duration based on category
  const durationMap = {
    museum: 120, gallery: 90, park: 60, restaurant: 60, cafe: 30,
    attraction: 60, viewpoint: 30, hotel: 0, bar: 45, pub: 45,
    shopping: 60, mall: 90
  };

  // Estimate cost based on category
  const costMap = {
    museum: 15, gallery: 10, park: 0, restaurant: 25, cafe: 8,
    attraction: 10, viewpoint: 0, hotel: 0, bar: 15, pub: 10,
    shopping: 30
  };

  // Simulate popularity (in production, use real data)
  const popularity = Math.floor(Math.random() * 100);
  const rating = +(3 + Math.random() * 2).toFixed(1);

  return {
    name,
    category,
    coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
    address: [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', '),
    description: tags.description || tags['description:en'] || '',
    osmId: `${element.type}/${element.id}`,
    tags: Object.keys(tags).filter(k => ['tourism', 'amenity', 'leisure', 'shop'].includes(k)),
    openingHours: tags.opening_hours || '',
    visitDuration: durationMap[category] || 60,
    estimatedCost: costMap[category] || 10,
    rating,
    popularity,
    isHiddenGem: popularity < 40 && rating >= 3.8,
    website: tags.website || '',
    phone: tags.phone || ''
  };
};

const fetchLocations = async (lat, lng, categories = ['tourism', 'restaurant', 'park'], radiusMeters = 5000) => {
  try {
    const query = buildOverpassQuery(lat, lng, radiusMeters, categories);
    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      query,
      {
        headers: { 'Content-Type': 'text/plain' },
        timeout: 30000
      }
    );

    const elements = response.data?.elements || [];
    const places = elements
      .map(parseOSMResult)
      .filter(Boolean)
      .filter((p, idx, arr) => arr.findIndex(x => x.name === p.name) === idx); // dedupe by name

    return places;
  } catch (err) {
    console.error('Overpass API error:', err.message);
    return getFallbackLocations(lat, lng);
  }
};

// Fallback sample data if OSM API fails
const getFallbackLocations = (lat, lng) => {
  const offsets = [
    { dlat: 0.005, dlng: 0.005, name: 'City Museum', category: 'museum', visitDuration: 120, estimatedCost: 15 },
    { dlat: -0.003, dlng: 0.008, name: 'Central Park', category: 'park', visitDuration: 60, estimatedCost: 0 },
    { dlat: 0.008, dlng: -0.004, name: 'Local Market', category: 'attraction', visitDuration: 60, estimatedCost: 10 },
    { dlat: -0.006, dlng: -0.006, name: 'Historic Cathedral', category: 'attraction', visitDuration: 45, estimatedCost: 5 },
    { dlat: 0.010, dlng: 0.003, name: 'Art Gallery', category: 'gallery', visitDuration: 90, estimatedCost: 12 },
    { dlat: -0.009, dlng: 0.010, name: 'Local Restaurant', category: 'restaurant', visitDuration: 60, estimatedCost: 25 },
    { dlat: 0.003, dlng: -0.010, name: 'City Viewpoint', category: 'viewpoint', visitDuration: 30, estimatedCost: 0 },
    { dlat: 0.012, dlng: 0.007, name: 'Botanical Garden', category: 'park', visitDuration: 90, estimatedCost: 8 },
    { dlat: -0.011, dlng: -0.003, name: 'Shopping District', category: 'shopping', visitDuration: 60, estimatedCost: 30 },
    { dlat: 0.007, dlng: -0.012, name: 'Cultural Center', category: 'museum', visitDuration: 75, estimatedCost: 10 }
  ];
  return offsets.map((o, i) => ({
    name: o.name,
    category: o.category,
    coordinates: { lat: lat + o.dlat, lng: lng + o.dlng },
    address: 'City Center',
    description: `A popular ${o.category} in the area`,
    osmId: `fallback/${i}`,
    tags: [o.category],
    openingHours: '09:00-18:00',
    visitDuration: o.visitDuration,
    estimatedCost: o.estimatedCost,
    rating: +(3.5 + Math.random() * 1.5).toFixed(1),
    popularity: Math.floor(Math.random() * 100),
    isHiddenGem: false
  }));
};

const geocodeAddress = async (query) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: query, format: 'json', limit: 5, addressdetails: 1 },
      headers: { 'User-Agent': 'TravelPlannerApp/1.0' },
      timeout: 10000
    });
    return response.data.map(r => ({
      name: r.display_name.split(',').slice(0, 2).join(','),
      fullName: r.display_name,
      coordinates: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
      country: r.address?.country || '',
      placeId: r.place_id?.toString()
    }));
  } catch (err) {
    console.error('Nominatim error:', err.message);
    return [];
  }
};

module.exports = { fetchLocations, geocodeAddress, getFallbackLocations };
