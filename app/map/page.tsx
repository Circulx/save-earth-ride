'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, TreePine, Navigation, Bike } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/map/InteractiveMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading interactive map...</p>
      </div>
    </div>
  ),
});

// Sample map data (in production, this would come from admin panel)
const mapLocations = [
  {
    id: 1,
    name: 'Himalayan Tree Drive',
    location: 'Kathmandu, Nepal',
    coordinates: { lat: 27.7172, lng: 85.3240 },
    date: '2024-12-15',
    type: 'Tree Planting',
    participants: 200,
    treesPlanted: 1000,
    image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 2,
    name: 'Pacific Coast Green Ride',
    location: 'Sydney, Australia',
    coordinates: { lat: -33.8688, lng: 151.2093 },
    date: '2024-11-20',
    type: 'Beach Cleanup',
    participants: 350,
    treesPlanted: 800,
    image: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 3,
    name: 'European Unity Ride',
    location: 'Berlin, Germany',
    coordinates: { lat: 52.5200, lng: 13.4050 },
    date: '2024-10-05',
    type: 'Awareness',
    participants: 1200,
    treesPlanted: 3000,
    image: 'https://images.pexels.com/photos/1005648/pexels-photo-1005648.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 4,
    name: 'Amazon Conservation',
    location: 'Manaus, Brazil',
    coordinates: { lat: -3.1190, lng: -60.0217 },
    date: '2024-09-12',
    type: 'Conservation',
    participants: 500,
    treesPlanted: 2500,
    image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 5,
    name: 'Desert Oasis Project',
    location: 'Dubai, UAE',
    coordinates: { lat: 25.2048, lng: 55.2708 },
    date: '2024-08-30',
    type: 'Desert Greening',
    participants: 150,
    treesPlanted: 500,
    image: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
  {
    id: 6,
    name: 'Great Lakes Restoration',
    location: 'Toronto, Canada',
    coordinates: { lat: 43.6532, lng: -79.3832 },
    date: '2024-07-15',
    type: 'Water Conservation',
    participants: 400,
    treesPlanted: 1500,
    image: 'https://images.pexels.com/photos/1005648/pexels-photo-1005648.jpeg?auto=compress&cs=tinysrgb&w=300',
  },
];

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<typeof mapLocations[0] | null>(null);
  const [adminLocations, setAdminLocations] = useState(mapLocations);

  // Listen for real-time updates from admin panel
  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      if (event.detail.section === 'mapLocations') {
        setAdminLocations(event.detail.data);
      }
    };

    window.addEventListener('adminDataUpdate', handleAdminUpdate as EventListener);
    return () => window.removeEventListener('adminDataUpdate', handleAdminUpdate as EventListener);
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('selectedLocation');
    if (savedData) {
      try{
        const parsed = JSON.parse(savedData);
        const location = adminLocations.find(loc => loc.id === parsed.id);
        setSelectedLocation(location || null);
      } catch (error) {
        console.error('Error Parsing save Location Data : ', error);
      }
    }

    const handleAdminUpdate = (event: CustomEvent) => {
      if (event.detail.section === 'mapLocations') {
        setAdminLocations(event.detail.data);
      }
    };
    window.addEventListener('adminDataUpdate', handleAdminUpdate as EventListener);
    return () => window.removeEventListener('adminDataUpdate', handleAdminUpdate as EventListener);
  }, []);

  useEffect(() => {
  // 1. Load from localStorage on first render
  const savedMapData = localStorage.getItem('mapData');
  if (savedMapData) {
    try {
      const parsed = JSON.parse(savedMapData);
      if (Array.isArray(parsed)) {
        setAdminLocations(parsed);
      }
    } catch (error) {
      console.error('Error parsing mapData from localStorage:', error);
    }
  }

  // 2. Listen for admin updates
  const handleAdminUpdate = (event: CustomEvent) => {
    if (event.detail.section === 'mapLocations') {
      setAdminLocations(event.detail.data);
    }
  };

  // window.addEventListener('adminDataUpdate', handleAdminUpdate as EventListener);
  // return () => window.removeEventListener('adminDataUpdate', handleAdminUpdate as EventListener);

  window.addEventListener('storage', () => {
    const updated = localStorage.getItem('mapData');
    if (updated) setAdminLocations(JSON.parse(updated));
  });
}, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Tree Planting': return 'bg-green-100 text-green-800';
      case 'Beach Cleanup': return 'bg-blue-100 text-blue-800';
      case 'Conservation': return 'bg-amber-100 text-amber-800';
      case 'Awareness': return 'bg-purple-100 text-purple-800';
      case 'Desert Greening': return 'bg-orange-100 text-orange-800';
      case 'Water Conservation': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLocationClick = (location: typeof mapLocations[0]) => {
    setSelectedLocation(location);
  };

  const redirectToGallery = (location: typeof mapLocations[0]) => {
    const city = location.location.split(', ')[0];
    const country = location.location.split(', ')[1];
    // Use router for better navigation
    window.location.href = `/gallery?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <MapPin className="h-12 w-12 text-primary" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <Bike className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Global Impact Map
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Explore our worldwide environmental initiatives and see where Save Earth Ride has made a difference. Click on any pin to view photos from that location.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5" />
                  <span>Interactive World Map</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <MapComponent 
                  locations={adminLocations} 
                  onLocationClick={handleLocationClick}
                  selectedLocation={selectedLocation}
                />
              </CardContent>
            </Card>
          </div>

          {/* Location Details */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <CardTitle>Event Locations</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {adminLocations.map((location) => (
                    <div
                      key={location.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedLocation?.id === location.id
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleLocationClick(location)}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={location.image}
                          alt={location.name}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-sm"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {location.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {location.location}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getTypeColor(location.type)}>
                              {location.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selected Location Details */}
            {selectedLocation && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <img
                      src={selectedLocation.image}
                      alt={selectedLocation.name}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {selectedLocation.name}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{selectedLocation.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{new Date(selectedLocation.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{selectedLocation.participants} participants</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TreePine className="h-4 w-4 text-gray-500" />
                          <span>{selectedLocation.treesPlanted} trees planted</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600" 
                      onClick={() => redirectToGallery(selectedLocation)}
                    >
                      View Photos from this Location
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Global Impact Statistics
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {adminLocations.length}
              </div>
              <div className="text-green-100">Event Locations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {adminLocations.reduce((sum, loc) => sum + loc.participants, 0).toLocaleString()}
              </div>
              <div className="text-blue-100">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {adminLocations.reduce((sum, loc) => sum + loc.treesPlanted, 0).toLocaleString()}
              </div>
              <div className="text-purple-100">Trees Planted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {new Set(adminLocations.map(loc => loc.location.split(', ')[1])).size}
              </div>
              <div className="text-orange-100">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}