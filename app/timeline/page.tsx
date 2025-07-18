'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, TreePine, Bike, Clock, Loader2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface TimelineItem {
  id: number;
  date: string;
  title: string;
  location: string;
  type: string;
  participants: number;
  treesPlanted: number;
  description: string;
  image: string;
  side: 'left' | 'right';
  contactEmail?: string;
}

export default function TimelinePage() {
  const [timelineEvents, setTimelineEvents] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Fetch timeline data from Google Sheets API
  const fetchTimelineData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/timeline');
      const result = await response.json();
      
      if (result.success && result.data) {
        // Sort events by date (newest first)
        const sortedEvents = result.data.sort((a: TimelineItem, b: TimelineItem) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTimelineEvents(sortedEvents);
      } else {
        setError('Failed to load timeline data');
        console.error('Error loading timeline data:', result.error);
      }
    } catch (error) {
      setError('Failed to connect to server');
      console.error('Error fetching timeline data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimelineData();
  }, []);

  // Listen for real-time updates from admin panel
  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      if (event.detail.section === 'timeline') {
        setTimelineEvents(event.detail.data);
      }
    };

    window.addEventListener('adminDataUpdate', handleAdminUpdate as EventListener);
    return () => window.removeEventListener('adminDataUpdate', handleAdminUpdate as EventListener);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Tree Planting': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Conservation': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Beach Cleanup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Awareness': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Desert Greening': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Global Event': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Water Conservation': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'Urban Planting': return 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-500" />
          <p className="text-gray-600 dark:text-gray-300 text-lg">Loading our environmental journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={fetchTimelineData} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-16">
          <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
            <div className="relative">
              <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-green-500 dark:text-blue-500" />
              {/* <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center"> */}
                {/* <Bike className="h-2 w-2 sm:h-3 sm:w-3 text-white" /> */}
              {/* </div> */}
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 dark:text-blue-400 mb-4 sm:mb-6">
            Our Environmental Journey
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Follow our environmental journey through major events, rides, and conservation efforts around the world. 
            Every milestone represents our commitment to a greener future.
          </p>
          {timelineEvents.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <Button onClick={fetchTimelineData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          )}
        </div>

        {timelineEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No timeline events found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Check back later for updates</p>
          </div>
        ) : (
          <>
            {/* Desktop Timeline */}
            <div className="hidden lg:block relative">
              {/* Vertical Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-green-500 to-blue-500 rounded-full shadow-lg"></div>

              {/* Timeline Items */}
              <div className="space-y-16">
                {timelineEvents.map((event, index) => (
                  <div key={event.id} className={`relative flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}>
                    {/* Timeline Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white rounded-full border-4 border-green-500 dark:border-blue-500 shadow-xl z-10 flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 dark:bg-blue-500 rounded-full animate-pulse"></div>
                    </div>

                    {/* Event Card */}
                    <Card className={`group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-xl w-full max-w-md ${
                      index % 2 === 0 ? 'mr-8' : 'ml-8'
                    } overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <CardContent className="p-0 relative z-10">
                        <div className="relative overflow-hidden">
                          {event.image && (
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-4 left-4">
                            <Badge className={`${getTypeColor(event.type)} shadow-lg`}>
                              {event.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <Calendar className="h-4 w-4 text-green-500" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-blue-400 transition-colors">
                            {event.title}
                          </h3>
                          
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-4">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                              <Users className="h-4 w-4" />
                              <span>{event.participants.toLocaleString()} riders</span>
                            </div>
                            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                              <TreePine className="h-4 w-4" />
                              <span>{event.treesPlanted.toLocaleString()} trees</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Timeline */}
            <div className="lg:hidden space-y-6">
              {timelineEvents.map((event) => (
                <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <div className="relative">
                      {event.image && (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      <div className="absolute top-3 left-3">
                        <Badge className={`${getTypeColor(event.type)} shadow-lg text-xs`}>
                          {event.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="text-sm truncate">{event.location}</span>
                      </div>
                      
                      <div className="mb-4">
                        <p className={`text-gray-600 dark:text-gray-400 text-sm leading-relaxed ${
                          expandedItems.has(event.id) ? '' : 'line-clamp-2'
                        }`}>
                          {event.description}
                        </p>
                        {event.description && event.description.length > 100 && (
                          <button
                            onClick={() => toggleExpanded(event.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 flex items-center space-x-1"
                          >
                            <span>{expandedItems.has(event.id) ? 'Show Less' : 'Read More'}</span>
                            {expandedItems.has(event.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                          <Users className="h-4 w-4" />
                          <span>{event.participants.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                          <TreePine className="h-4 w-4" />
                          <span>{event.treesPlanted.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="mt-12 sm:mt-20 bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 sm:p-12 text-white shadow-2xl">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
                  Our Environmental Impact
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-green-400">
                      {timelineEvents.reduce((sum, event) => sum + event.treesPlanted, 0).toLocaleString()}
                    </div>
                    <div className="text-green-300 text-sm sm:text-base">Trees Planted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-blue-400">
                      {timelineEvents.reduce((sum, event) => sum + event.participants, 0).toLocaleString()}
                    </div>
                    <div className="text-blue-300 text-sm sm:text-base">Participants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-purple-400">
                      {timelineEvents.length}
                    </div>
                    <div className="text-purple-300 text-sm sm:text-base">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-orange-400">
                      {new Set(timelineEvents.map(event => event.date.split('-')[0])).size}
                    </div>
                    <div className="text-orange-300 text-sm sm:text-base">Years</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}