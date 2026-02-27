'use client';

import { useEffect, useRef } from 'react';

export interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onLocationChange: (lat: string, lng: string) => void;
}

export function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const defaultLat = 27.7172;
  const defaultLng = 85.3240;
  
  const currentLat = latitude ? parseFloat(latitude) : defaultLat;
  const currentLng = longitude ? parseFloat(longitude) : defaultLng;

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - 0.01},${currentLat - 0.01},${currentLng + 0.01},${currentLat + 0.01}&layer=mapnik&marker=${currentLat},${currentLng}`;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.lat && event.data.lng) {
        onLocationChange(event.data.lat.toFixed(6), event.data.lng.toFixed(6));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLocationChange]);

  return (
    <div className="space-y-2">
      <div className="w-full h-64 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100">
        <iframe
          ref={iframeRef}
          src={osmUrl}
          className="w-full h-full border-0"
          title="Location Map"
        />
      </div>
      <div className="flex items-start gap-2 text-xs text-gray-500">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          View the location on the map. To change coordinates, manually edit the latitude and longitude fields above.
        </span>
      </div>
    </div>
  );
}
