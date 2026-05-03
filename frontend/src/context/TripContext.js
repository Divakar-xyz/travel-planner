import React, { createContext, useContext, useState, useCallback } from 'react';
import { tripAPI, itineraryAPI } from '../services/api';

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });

  const fetchTrips = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await tripAPI.getAll(params);
      setTrips(data.trips);
      setPagination({ total: data.total, pages: data.pages, page: data.page });
    } finally { setLoading(false); }
  }, []);

  const fetchTrip = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data } = await tripAPI.getOne(id);
      setCurrentTrip(data);
      return data;
    } finally { setLoading(false); }
  }, []);

  const createTrip = async (tripData) => {
    const { data } = await tripAPI.create(tripData);
    setTrips(prev => [data.trip, ...prev]);
    return data.trip;
  };

  const updateTrip = async (id, updates) => {
    const { data } = await tripAPI.update(id, updates);
    setTrips(prev => prev.map(t => t._id === id ? data.trip : t));
    if (currentTrip?.trip?._id === id) setCurrentTrip(prev => ({ ...prev, trip: data.trip }));
    return data.trip;
  };

  const deleteTrip = async (id) => {
    await tripAPI.delete(id);
    setTrips(prev => prev.filter(t => t._id !== id));
  };

  const fetchItinerary = useCallback(async (tripId) => {
    const { data } = await itineraryAPI.get(tripId);
    setItinerary(data.itinerary);
    return data.itinerary;
  }, []);

  const generateItinerary = async (tripId, options) => {
    setLoading(true);
    try {
      const { data } = await itineraryAPI.generate(tripId, options);
      setItinerary(data.itinerary);
      return data;
    } finally { setLoading(false); }
  };

  const removePlace = async (tripId, dayNumber, placeId) => {
    const { data } = await itineraryAPI.removePlace(tripId, dayNumber, placeId);
    setItinerary(prev => ({
      ...prev,
      days: prev.days.map(d => d.dayNumber === dayNumber ? data.day : d)
    }));
  };

  const replanDay = async (tripId, dayNumber, removedPlaceId) => {
    const { data } = await itineraryAPI.replanDay(tripId, dayNumber, { removedPlaceId });
    setItinerary(prev => ({
      ...prev,
      days: prev.days.map(d => d.dayNumber === dayNumber ? data.day : d)
    }));
  };

  return (
    <TripContext.Provider value={{
      trips, currentTrip, itinerary, loading, pagination,
      fetchTrips, fetchTrip, createTrip, updateTrip, deleteTrip,
      fetchItinerary, generateItinerary, removePlace, replanDay, setItinerary
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used within TripProvider');
  return ctx;
};
