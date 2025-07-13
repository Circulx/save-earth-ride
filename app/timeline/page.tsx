'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, TreePine, Bike, Clock } from 'lucide-react';

const initialTimelineEvents = [
  {
    id: 1,
    date: '2024-12-15',
    title: 'Amazon Conservation Mega Ride',
    location: 'Manaus, Brazil',
    type: 'Conservation',
    participants: 500,
    treesPlanted: 2500,
    description: 'Our largest conservation ride yet, bringing together 500 riders from across South America to raise awareness about Amazon deforestation.',
    image: 'https://images.pexels.com/photos/1005648/pexels-photo-1005648.jpeg?auto=compress&cs=tinysrgb&w=500',
    side: 'left',
  },
  {
    id: 2,
    date: '2024-11-20',
    title: 'Himalayan Tree Drive',
    location: 'Kathmandu, Nepal',
    type: 'Tree Planting',
    participants: 200,
    treesPlanted: 1000,
    description: 'Epic high-altitude ride through the Himalayas, planting native trees to combat deforestation in the region.',
    image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=500',
    side: 'right',
  },
  {
    id: 3,
    date: '2024-10-05',
    title: 'European Unity Ride',
    location: 'Multiple Cities, Europe',
    type: 'Awareness',
    participants: 1200,
    treesPlanted: 3000,
    description: 'Cross-border ride connecting 12 European countries, promoting unity in environmental action.',
    image: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=500',
    side: 'left',
  },
  {
    id: 4,
    date: '2024-08-12',
    title: 'Pacific Coast Green Ride',
    location: 'Sydney, Australia',
    type: 'Beach Cleanup',
    participants: 350,
    treesPlanted: 800,
    description: 'Coastal ride combined with beach cleanup and mangrove planting along the Pacific Coast.',
    image: 'https://images.pexels.com/photos/1005648/pexels-photo-1005648.jpeg?auto=compress&cs=tinysrgb&w=500',
    side: 'right',
  },
  {
    id: 5,
    date: '2024-06-30',
    title: 'Desert Oasis Project',
    location: 'Dubai, UAE',
    type: 'Desert Greening',
    participants: 150,
    treesPlanted: 500,
    description: 'Innovative desert greening project creating sustainable oases in arid landscapes.',
    image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=500',
    side: 'left',
  },
  {
    id: 6,
    date: '2024-04-22',
    title: 'Earth Day Global Ride',
    location: 'Worldwide',
    type: 'Global Event',
    participants: 5000,
    treesPlanted: 10000,
    description: 'Our biggest event ever! Simultaneous rides in 50 countries celebrating Earth Day.',
    image: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=500',
    side: 'right',
  },
];

export default function TimelinePage() {
  const [timelineEvents, setTimelineEvents] = useState(initialTimelineEvents);

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

  useEffect(() => {
    const savedData = localStorage.getItem('timelineData');
    if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      const valid = parsed.filter((item: any) => item.title && item.date && item.location);
      setTimelineEvents(valid);
    } catch (e) {
      console.error('Error parsing timelineData:', e);
    }
  }

  // Listen for admin panel updates
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
      case 'Tree Planting': return 'bg-green-100 text-green-800';
      case 'Conservation': return 'bg-amber-100 text-amber-800';
      case 'Beach Cleanup': return 'bg-blue-100 text-blue-800';
      case 'Awareness': return 'bg-purple-100 text-purple-800';
      case 'Desert Greening': return 'bg-orange-100 text-orange-800';
      case 'Global Event': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Calendar className="h-12 w-12 text-green-500 dark:text-blue-500" />
              {/* <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <Bike className="h-3 w-3 text-white" />
              </div> */}
            </div>
          </div>
          <h1 className="text-5xl font-bold text-green-500 dark:text-blue-500 bg-clip-text mb-6">
            Our Journey Timeline
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Follow our environmental journey through major events, rides, and conservation efforts around the world. Every milestone represents our commitment to a greener future.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-500 dark:bg-blue-500 rounded-full shadow-lg"></div>

          {/* Timeline Items */}
          <div className="space-y-16">
            {timelineEvents.map((event, index) => (
              <div key={event.id} className={`relative flex items-center ${
                event.side === 'left' ? 'justify-start' : 'justify-end'
              }`}>
                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-green-500 dark:bg-blue-500 rounded-full border-3 border-white dark:border-green shadow-xl z-10 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>

                {/* Event Card */}
                <Card className={`card-hover border-0 shadow-xl w-full max-w-md ${
                  event.side === 'left' ? 'mr-8' : 'ml-8'
                } group overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="p-0 relative z-10">
                    <div className="relative overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getTypeColor(event.type)} shadow-lg`}>
                          {event.type}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center space-x-2 text-sm">
                          <Bike className="h-4 w-4" />
                          <span>Environmental Action</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{new Date(event.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2 text-gray-600 mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {event.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Users className="h-4 w-4" />
                          <span>{event.participants} riders</span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-600">
                          <TreePine className="h-4 w-4" />
                          <span>{event.treesPlanted} trees</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mt-20 bg-gray-800 rounded-2xl p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-8">
              Timeline Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {timelineEvents.reduce((sum, event) => sum + event.treesPlanted, 0).toLocaleString()}
                </div>
                <div className="text-green-500 dark:text-blue-500">Trees Planted</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {timelineEvents.reduce((sum, event) => sum + event.participants, 0).toLocaleString()}
                </div>
                <div className="text-green-500 dark:text-blue-500 ">Total Participants</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {timelineEvents.length}
                </div>
                <div className="text-green-500 dark:text-blue-500 ">Major Events</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {new Set(timelineEvents.map(event => event.date.split('-')[0])).size}
                </div>
                <div className="text-green-500 dark:text-blue-500 ">Active Years</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}