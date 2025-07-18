'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TreePine, Users, MapPin, Heart, Bike, Zap, Wind } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  const [treeCount, setTreeCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tree count from Google Sheets via API
  const fetchTreeCount = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const result = await response.json();
      
      if (result.success && result.data.treeCount) {
        setTargetCount(result.data.treeCount.count);
      }
    } catch (error) {
      console.error('Error fetching tree count:', error);
      // Fallback to default value
      setTargetCount(25847);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTreeCount();

    // Set up polling for real-time updates every 30 seconds
    const pollInterval = setInterval(fetchTreeCount, 30000);

    // Listen for custom events from admin updates
    const handleAdminUpdate = (event: CustomEvent) => {
      if (event.detail.section === 'treeCount') {
        setTargetCount(event.detail.data);
      }
    };

    window.addEventListener('adminDataUpdate', handleAdminUpdate as EventListener);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('adminDataUpdate', handleAdminUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    if (targetCount === 0) return;

    // Animate counter when target changes
    const timer = setInterval(() => {
      setTreeCount(prev => {
        if (prev < targetCount) {
          const increment = Math.max(Math.floor(targetCount / 100), 50);
          return Math.min(prev + increment, targetCount);
        }
        return targetCount;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [targetCount]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Real Bike Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 20, 0.4), rgba(0, 0, 0, 0.5)),url(https://images.pexels.com/photos/2396045/pexels-photo-2396045.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      />
      <div className="absolute inset-0 backdrop-blur" />
      
      {/* Floating Bike Elements */}
      <div className="absolute top-20 left-10 float-animation">
        {/* <Bike className="h-12 w-12 text-white/30" /> */}
      </div>
      <div className="absolute top-40 right-20 float-animation" style={{ animationDelay: '1s' }}>
        {/* <Zap className="h-8 w-8 text-yellow-400/40" /> */}
      </div>
      <div className="absolute bottom-40 left-20 float-animation" style={{ animationDelay: '2s' }}>
        {/* <Wind className="h-10 w-10 text-blue-400/30" /> */}
      </div>
      <div className="absolute top-60 left-1/2 float-animation" style={{ animationDelay: '3s' }}>
        {/* <TreePine className="h-14 w-14 text-green-400/40" /> */}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {/* <Bike className="h-16 w-16 text-yellow-400 animate-bounce" /> */}
            {/* <TreePine className="h-20 w-20 text-green-400 animate-pulse" /> */}
            {/* <Bike className="h-16 w-16 text-blue-400 animate-bounce" style={{ animationDelay: '0.5s' }} /> */}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight ">
            <span className="flex items-center justify-center space-x-4 text-4xl md:text-6xl text-green-400 dark:text-blue-500 rounded-lg shadow-4 clip-text">
              {/* <Bike className="h-12 md:h-16 text-yellow-400" /> */}
              <span>Save Earth</span>
              {/* <Bike className="h-12 md:h-16 text-blue-400" /> */}
            </span>
            <span className="block text-4xl md:text-6xl text-green-400 dark:text-blue-500 rounded-lg shadow-4 clip-text mt-4">
              One Ride at a Time
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto">
            Join the global community of bikers united in protecting our planet through tree plantation and environmental awareness.
          </p>

          {/* Enhanced Tree Counter with Google Sheets Integration */}
          <div className="flex items-center justify-center space-x-4 my-8">
            <div className="bg-white/10 backdrop-blur-sm dark:bg-gray-600/50 backdrop-blur-md rounded-2xl p-6 pulse-green relative overflow-hidden">
              <div className="absolute top-2 right-2">
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <TreePine className="h-8 w-8 text-green-400" />
                <div>
                  <div className="text-3xl font-bold text-green-400">
                    {treeCount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-200">Trees Planted by Riders</div>
                  {/* <div className="text-xs text-gray-300 mt-1">
                    Live count from Google Sheets
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 flex items-center space-x-2">
                {/* <Bike className="h-5 w-5" /> */}
                <span>Join the Ride</span>
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 flex items-center space-x-2">
                <TreePine className="h-5 w-5" />
                <span>View Adventures</span>
              </Button>
            </Link>
          </div>

          {/* Enhanced Quick Stats with Bike Theme */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="text-center bg-white/20 backdrop-blur-sm dark:bg-gray-600/50 backdrop-blur-md rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <MapPin className="h-5 w-5 text-blue-400" />
                {/* <Bike className="h-4 w-4 text-yellow-400" /> */}
              </div>
              <div className="text-2xl font-bold">150+</div>
              <div className="text-sm text-gray-200">Countries</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm dark:bg-gray-600/50 backdrop-blur-md rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-green-400" />
                {/* <Bike className="h-4 w-4 text-blue-400" /> */}
              </div>
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-sm text-gray-200">Riders</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm dark:bg-gray-600/50 backdrop-blur-md rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                {/* <Bike className="h-4 w-4 text-green-400" /> */}
              </div>
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-gray-200">Eco Rides</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm dark:bg-gray-600/50 backdrop-blur-md rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TreePine className="h-5 w-5 text-green-400" />
                {/* <Bike className="h-4 w-4 text-blue-400" /> */}
              </div>
              <div className="text-2xl font-bold">{Math.floor(treeCount / 1000)}K+</div>
              <div className="text-sm text-gray-200">Trees</div>
            </div>
          </div>

          {/* Bike-themed Call to Action */}
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm dark:bg-gray-600/50 backdrop-blur-md rounded-2xl">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {/* <Bike className="h-8 w-8 text-yellow-400 animate-bounce" /> */}
              <span className="text-lg font-semibold">Ready to Ride for the Planet?</span>
              {/* <Bike className="h-8 w-8 text-blue-400 animate-bounce" style={{ animationDelay: '0.5s' }} /> */}
            </div>
            <p className="text-green-400 dark:text-blue-400 text-lg mb-4 max-w-2xl mx-auto">
              Every mile counts • Every tree matters • Every rider makes a difference
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}