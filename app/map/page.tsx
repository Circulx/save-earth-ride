'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, TreePine, Navigation, Bike, Loader2, RefreshCw } from 'lucide-react';
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

// Interface for map location data
interface MapLocation {
  id: number;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  date: string;
  type: string;
  participants: number;
  treesPlanted: number;
  image: string;
  description?: string;
  organizer?: string;
  status?: string;
}

export default function MapPage() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from Google Sheets API
  const loadMapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/map');
      const result = await response.json();
      
      if (result.success) {
        setMapLocations(result.data);
      } else {
        setError('Failed to load map data');
        console.error('API Error:', result.error);
      }
    } catch (error) {
      console.error('Error loading map data:', error);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadMapData();
  }, []);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadMapData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Tree Planting': return 'bg-green-100 text-green-800';
      case 'Beach Cleanup': return 'bg-blue-100 text-blue-800';
      case 'Conservation': return 'bg-amber-100 text-amber-800';
      case 'Awareness': return 'bg-purple-100 text-purple-800';
      case 'Desert Greening': return 'bg-orange-100 text-orange-800';
      case 'Water Conservation': return 'bg-cyan-100 text-cyan-800';
      case 'Urban Planting': return 'bg-lime-100 text-lime-800';
      case 'Mountain Cleanup': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
  };

  const redirectToGallery = (location: MapLocation) => {
    const city = location.location.split(', ')[0];
    const country = location.location.split(', ')[1];
    // Use router for better navigation
    window.location.href = `/gallery?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;
  };

  // Loading state
  if (loading && mapLocations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && mapLocations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MapPin className="h-12 w-12 mx-auto mb-2" />
            <p className="text-xl font-semibold">Failed to load map data</p>
            <p className="text-gray-600">{error}</p>
          </div>
          <Button onClick={loadMapData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
          
          {/* Refresh Button */}
          <div className="mt-6">
            <Button 
              onClick={loadMapData} 
              variant="outline"
              disabled={loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Refresh Data</span>
            </Button>
          </div>
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
                  locations={mapLocations} 
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
                <CardTitle className="flex items-center justify-between">
                  <span>Event Locations</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {mapLocations.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mapLocations.map((location) => (
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
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            <Badge className={getTypeColor(location.type)}>
                              {location.type}
                            </Badge>
                            {location.status && (
                              <Badge className={getStatusColor(location.status)}>
                                {location.status}
                              </Badge>
                            )}
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
                      {selectedLocation.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {selectedLocation.description}
                        </p>
                      )}
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
                        {selectedLocation.organizer && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Organizer:</span>
                            <span className="font-medium">{selectedLocation.organizer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getTypeColor(selectedLocation.type)}>
                        {selectedLocation.type}
                      </Badge>
                      {selectedLocation.status && (
                        <Badge className={getStatusColor(selectedLocation.status)}>
                          {selectedLocation.status}
                        </Badge>
                      )}
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
            <p className="text-green-100">
              Real-time data from our global network
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {mapLocations.length}
              </div>
              <div className="text-green-100">Event Locations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {mapLocations.reduce((sum, loc) => sum + loc.participants, 0).toLocaleString()}
              </div>
              <div className="text-blue-100">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {mapLocations.reduce((sum, loc) => sum + loc.treesPlanted, 0).toLocaleString()}
              </div>
              <div className="text-purple-100">Trees Planted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {new Set(mapLocations.map(loc => loc.location.split(', ')[1])).size}
              </div>
              <div className="text-orange-100">Countries</div>
            </div>
          </div>
        </div>

        {/* Loading indicator for refresh */}
        {loading && mapLocations.length > 0 && (
          <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-gray-600">Refreshing data...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}