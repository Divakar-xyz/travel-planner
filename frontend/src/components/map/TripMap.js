import React, { useEffect, useRef } from 'react';

let L = null;

const categoryColors = {
  museum:'#a855f7', gallery:'#ec4899', park:'#10b981', restaurant:'#f59e0b',
  cafe:'#f97316', attraction:'#38bdf8', viewpoint:'#06b6d4', hotel:'#6366f1',
  bar:'#8b5cf6', pub:'#7c3aed', shopping:'#f43f5e', default:'#38bdf8'
};

const TripMap = ({ center, zoom = 13, places = [], route = [], showRoute = false, height = '100%', onPlaceClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const routeLayerRef = useRef(null);

  useEffect(() => {
    L = window.L;
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current, {
      center: center ? [center.lat, center.lng] : [20, 0],
      zoom: center ? zoom : 2,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !center) return;
    mapInstanceRef.current.setView([center.lat, center.lng], zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    places.forEach((place, idx) => {
      if (!place.coordinates?.lat || !place.coordinates?.lng) return;
      const color = categoryColors[place.category] || categoryColors.default;
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.4);cursor:pointer;transition:transform 0.2s;" title="${place.name}">
          ${place.order !== undefined ? `<span style="color:white;font-weight:700;font-size:11px;font-family:Syne,sans-serif;">${place.order+1}</span>` : '📍'}
        </div>`,
        iconSize: [32,32], iconAnchor: [16,16]
      });

      const marker = L.marker([place.coordinates.lat, place.coordinates.lng], { icon });
      marker.bindPopup(`
        <div style="min-width:180px;font-family:'DM Sans',sans-serif;">
          <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px;margin-bottom:4px;">${place.name}</div>
          <div style="font-size:12px;color:#94a3b8;text-transform:capitalize;margin-bottom:6px;">${place.category || 'Attraction'}</div>
          ${place.startTime ? `<div style="font-size:12px;color:#38bdf8;">🕐 ${place.startTime} – ${place.endTime}</div>` : ''}
          ${place.estimatedCost > 0 ? `<div style="font-size:12px;color:#f59e0b;margin-top:4px;">💰 ~$${place.estimatedCost}</div>` : ''}
          ${place.isHiddenGem ? '<div style="font-size:11px;color:#a855f7;margin-top:4px;">✨ Hidden Gem</div>' : ''}
          ${place.rating ? `<div style="font-size:12px;color:#10b981;margin-top:4px;">⭐ ${place.rating}/5</div>` : ''}
        </div>
      `, { closeButton: true });

      if (onPlaceClick) marker.on('click', () => onPlaceClick(place));
      marker.addTo(mapInstanceRef.current);
      markersRef.current.push(marker);
    });

    if (places.length > 0 && mapInstanceRef.current) {
      const group = L.featureGroup(markersRef.current);
      try { mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1)); } catch {}
    }
  }, [places, onPlaceClick]);

  useEffect(() => {
    if (!mapInstanceRef.current || !L) return;
    if (routeLayerRef.current) { routeLayerRef.current.remove(); routeLayerRef.current = null; }
    if (showRoute && route.length > 1) {
      const latlngs = route.map(p => [p.lat, p.lng]);
      routeLayerRef.current = L.polyline(latlngs, { color:'#38bdf8', weight:3, opacity:0.8, dashArray:'8,6', lineCap:'round' }).addTo(mapInstanceRef.current);
    }
  }, [route, showRoute]);

  return <div ref={mapRef} style={{ height, width:'100%', borderRadius:'var(--radius-lg)', overflow:'hidden' }} />;
};
export default TripMap;
