import React, { useEffect, useRef } from 'react';

// Declare window.L because we are loading Leaflet from CDN
declare global {
  interface Window {
    L: any;
  }
}

interface LocationPickerMapProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export const LocationPickerMap: React.FC<LocationPickerMapProps> = ({ initialLat, initialLng, onLocationSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Wait for Leaflet to load
    if (!mapRef.current || !window.L) return;

    // Default location (e.g., Jakarta) if none provided
    const defaultLat = -6.2088;
    const defaultLng = 106.8456;
    
    const lat = initialLat || defaultLat;
    const lng = initialLng || defaultLng;

    // Initialize map only once
    if (!mapInstanceRef.current) {
      const map = window.L.map(mapRef.current).setView([lat, lng], 16);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Create draggable marker
      const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);
      
      marker.on('dragend', function(event: any) {
        const marker = event.target;
        const position = marker.getLatLng();
        onLocationSelect(position.lat, position.lng);
      });

      mapInstanceRef.current = map;
    }
    
    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Empty dependency array to run only once on mount

  return <div ref={mapRef} className="h-96 w-full z-0 rounded-lg shadow-inner" />;
};