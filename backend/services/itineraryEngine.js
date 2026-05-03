/**
 * Custom Itinerary Engine
 * Rule-based algorithm using nearest-neighbor heuristic and time-slot optimization
 */

const haversineDistance = (coord1, coord2) => {
  const R = 6371;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
    Math.cos((coord2.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getTravelTime = (distanceKm, mode = 'mixed') => {
  const speeds = { walking: 4, transit: 20, mixed: 10 };
  return Math.ceil((distanceKm / speeds[mode]) * 60);
};

const nearestNeighborSort = (places, startCoord) => {
  if (!places || places.length === 0) return [];
  const unvisited = [...places];
  const ordered = [];
  let current = startCoord || unvisited[0].coordinates;
  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < unvisited.length; i++) {
      const dist = haversineDistance(current, unvisited[i].coordinates);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    ordered.push({ ...unvisited[nearestIdx], distanceFromPrev: nearestDist });
    current = unvisited[nearestIdx].coordinates;
    unvisited.splice(nearestIdx, 1);
  }
  return ordered;
};

const clusterPlaces = (places, radiusKm = 2) => {
  const clusters = [];
  const assigned = new Set();
  for (let i = 0; i < places.length; i++) {
    if (assigned.has(i)) continue;
    const cluster = [places[i]];
    assigned.add(i);
    for (let j = i + 1; j < places.length; j++) {
      if (assigned.has(j)) continue;
      const dist = haversineDistance(places[i].coordinates, places[j].coordinates);
      if (dist <= radiusKm) {
        cluster.push(places[j]);
        assigned.add(j);
      }
    }
    clusters.push(cluster);
  }
  return clusters;
};

const assignTimeSlots = (places, startHour = 9, endHour = 21, breakDuration = 60) => {
  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;
  const result = [];
  for (let i = 0; i < places.length; i++) {
    const place = places[i];
    const visitDuration = place.visitDuration || 60;
    const travelTime = i > 0 ? getTravelTime(place.distanceFromPrev || 0.5) : 0;
    currentMinutes += travelTime;
    if (currentMinutes < 13 * 60 && currentMinutes + visitDuration > 12 * 60 && i > 0) {
      currentMinutes = 13 * 60;
    }
    if (currentMinutes + visitDuration > endMinutes) break;
    const startHr = Math.floor(currentMinutes / 60);
    const startMin = currentMinutes % 60;
    const endHr = Math.floor((currentMinutes + visitDuration) / 60);
    const endMin = (currentMinutes + visitDuration) % 60;
    result.push({
      ...place,
      startTime: `${String(startHr).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`,
      endTime: `${String(endHr).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
      order: i
    });
    currentMinutes += visitDuration;
  }
  return result;
};

const scoreByWeather = (place, weatherCondition) => {
  const isOutdoor = ['park', 'beach', 'viewpoint', 'nature', 'sports'].some(tag =>
    place.tags?.includes(tag) || place.category?.includes(tag)
  );
  const isIndoor = ['museum', 'restaurant', 'mall', 'gallery', 'cinema'].some(tag =>
    place.tags?.includes(tag) || place.category?.includes(tag)
  );
  if (weatherCondition === 'rain' || weatherCondition === 'storm') {
    if (isIndoor) return 1.5;
    if (isOutdoor) return 0.3;
  } else if (weatherCondition === 'clear' || weatherCondition === 'sunny') {
    if (isOutdoor) return 1.5;
    if (isIndoor) return 0.8;
  }
  return 1.0;
};

const applyHiddenGemsFilter = (places, useHiddenGems = false) => {
  if (!useHiddenGems) return places;
  const sorted = [...places].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const topCutoff = Math.floor(sorted.length * 0.2);
  return places
    .filter((p) => sorted.indexOf(p) >= topCutoff)
    .map(p => ({ ...p, isHiddenGem: (p.popularity || 0) < 60 && (p.rating || 0) >= 3.5 }));
};

const distributePlacesAcrossDays = (places, numDays, pacePreference = 'moderate') => {
  const paceLimits = { slow: 3, moderate: 5, fast: 7 };
  const maxPerDay = paceLimits[pacePreference] || 5;
  const days = Array.from({ length: numDays }, () => []);
  let dayIndex = 0;
  const clusters = clusterPlaces(places);
  for (const cluster of clusters) {
    for (const place of cluster) {
      if (days[dayIndex].length >= maxPerDay) {
        dayIndex = Math.min(dayIndex + 1, numDays - 1);
      }
      days[dayIndex].push(place);
    }
    if (days[dayIndex].length >= maxPerDay) {
      dayIndex = Math.min(dayIndex + 1, numDays - 1);
    }
  }
  return days;
};

const generateItinerary = (places, tripDates, preferences = {}, weatherData = null) => {
  const { startTime = '09:00', endTime = '21:00', breakDuration = 60, pacePreference = 'moderate', useHiddenGems = false } = preferences;
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);
  let filteredPlaces = applyHiddenGemsFilter(places, useHiddenGems);
  if (weatherData) {
    filteredPlaces = filteredPlaces.map(p => ({ ...p, weatherScore: scoreByWeather(p, weatherData.condition) }))
      .sort((a, b) => (b.weatherScore || 1) - (a.weatherScore || 1));
  }
  const start = new Date(tripDates.start);
  const end = new Date(tripDates.end);
  const numDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const placesPerDay = distributePlacesAcrossDays(filteredPlaces, numDays, pacePreference);
  const itineraryDays = placesPerDay.map((dayPlaces, dayIdx) => {
    const date = new Date(start);
    date.setDate(date.getDate() + dayIdx);
    const orderedPlaces = nearestNeighborSort(dayPlaces, null);
    const timedPlaces = assignTimeSlots(orderedPlaces, startHour, endHour, breakDuration);
    let totalDistance = 0;
    let totalTravelTime = 0;
    let totalCost = 0;
    timedPlaces.forEach((p, i) => {
      if (i > 0) {
        const dist = p.distanceFromPrev || 0;
        totalDistance += dist;
        totalTravelTime += getTravelTime(dist);
      }
      totalCost += p.estimatedCost || 0;
    });
    const route = timedPlaces.map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }));
    return {
      dayNumber: dayIdx + 1,
      date: date.toISOString(),
      places: timedPlaces,
      estimatedDistance: Math.round(totalDistance * 10) / 10,
      estimatedTravelTime: totalTravelTime,
      totalEstimatedCost: Math.round(totalCost),
      route
    };
  });
  return itineraryDays;
};

const replanDay = (existingDay, removedPlaceId, preferences = {}) => {
  const remainingPlaces = existingDay.places.filter(p => p._id?.toString() !== removedPlaceId);
  const orderedPlaces = nearestNeighborSort(remainingPlaces, null);
  const startHour = parseInt((preferences.startTime || '09:00').split(':')[0]);
  const endHour = parseInt((preferences.endTime || '21:00').split(':')[0]);
  const timedPlaces = assignTimeSlots(orderedPlaces, startHour, endHour);
  let totalDistance = 0;
  let totalTravelTime = 0;
  timedPlaces.forEach((p, i) => {
    if (i > 0) {
      totalDistance += p.distanceFromPrev || 0;
      totalTravelTime += getTravelTime(p.distanceFromPrev || 0);
    }
  });
  return {
    ...existingDay,
    places: timedPlaces,
    estimatedDistance: Math.round(totalDistance * 10) / 10,
    estimatedTravelTime: totalTravelTime,
    route: timedPlaces.map(p => ({ lat: p.coordinates.lat, lng: p.coordinates.lng }))
  };
};

module.exports = { generateItinerary, replanDay, nearestNeighborSort, haversineDistance, clusterPlaces, assignTimeSlots };
