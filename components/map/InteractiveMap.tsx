'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bike marker icon
const bikeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="18.5" cy="17.5" r="3.5"/>
      <circle cx="5.5" cy="17.5" r="3.5"/>
      <circle cx="15" cy="5" r="1"/>
      <path d="m14 6.5 3 3 2.5-1.5"/>
      <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface Location {
  id: number;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  date: string;
  type: string;
  participants: number;
  treesPlanted: number;
  image: string;
}

interface InteractiveMapProps {
  locations: Location[];
  onLocationClick: (location: Location) => void;
  selectedLocation: Location | null;
}

function MapUpdater({ locations, selectedLocation }: { locations: Location[]; selectedLocation: Location | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedLocation) {
      map.setView([selectedLocation.coordinates.lat, selectedLocation.coordinates.lng], 8);
    }
  }, [selectedLocation, map]);

  return null;
}

export default function InteractiveMap({ locations, onLocationClick, selectedLocation }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater locations={locations} selectedLocation={selectedLocation} />
        
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={bikeIcon}
            eventHandlers={{
              click: () => onLocationClick(location),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <img
                  src={location.image}
                  alt={location.name}
                  className="w-full h-24 object-cover rounded mb-2"
                />
                <h3 className="font-semibold text-sm mb-1">{location.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{location.location}</p>
                <div className="text-xs space-y-1">
                  <div>📅 {new Date(location.date).toLocaleDateString()}</div>
                  <div>👥 {location.participants} participants</div>
                  <div>🌳 {location.treesPlanted} trees planted</div>
                </div>
                <button
                  onClick={() => {
                    const city = location.location.split(', ')[0];
                    const country = location.location.split(', ')[1];
                    // Navigate to gallery with location parameters
                    window.location.href = `/gallery?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
                  }}
                  className="mt-2 w-full bg-green-500 text-white text-xs py-1 px-2 rounded hover:bg-green-600 transition-colors"
                >
                  View Gallery
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}