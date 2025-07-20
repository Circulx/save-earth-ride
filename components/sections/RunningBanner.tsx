'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, TreePine, Bike, ArrowRight, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

/**
 * Current Drives Data Loader
 * 
 * This function loads current drives from the API (Google Sheets backend).
 * Falls back to localStorage for development/testing purposes.
 * 
 * @returns Array of current drive objects
 */
const getCurrentDrives = async () => {
  try {
    // Try to fetch from API first
    const response = await fetch('/api/drives?status=upcoming');
    if (response.ok) {
      const drives = await response.json();
      // Filter for upcoming drives with open registration
      return drives.filter((drive: any) => 
        drive.title && 
        drive.location && 
        drive.date && 
        drive.status === 'upcoming' &&
        drive.registrationOpen
      );
    }
  } catch (error) {
    console.error('Error fetching drives from API:', error);
  }

  // Fallback to localStorage for development
  // if (typeof window !== 'undefined') {
  //   try {
  //     const saved = localStorage.getItem('currentDrives');
  //     if (saved) {
  //       const drives = JSON.parse(saved);
  //       return drives.filter((drive: any) => 
  //         drive.title && 
  //         drive.location && 
  //         drive.date && 
  //         drive.status === 'upcoming' &&
  //         drive.registrationOpen
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error loading current drives from localStorage:', error);
  //   }
  // }
  
  // Final fallback data
  return [
    {
      id: 1,
      title: 'New Year Green Resolution Ride',
      location: 'Mumbai, India',
      date: '2025-01-01',
      participants: 150,
      treesTarget: 500,
      status: 'upcoming',
      registrationOpen: true,
      description: 'Start the new year with a green resolution! Join us for a massive tree planting drive.',
      organizer: 'Mumbai Riders Club',
      contactEmail: 'info@mumbairiders.com',
      difficulty: 'Easy',
      duration: '6 hours',
      meetingPoint: 'Marine Drive',
      registrationDeadline: '2024-12-28',
      logo: '/Save-earth-ride-logo.jpg'
    }
  ];
};

/**
 * Running Banner Component
 * 
 * Displays upcoming drives in a rotating banner at the top of the homepage.
 * Features:
 * - Real-time updates from Google Sheets via API
 * - Auto-rotation every 5 seconds
 * - Responsive design for mobile/desktop
 * - Dark mode support
 * - Data validation and error handling
 * - Synced with admin panel data structure
 */
export function RunningBanner() {
  const [currentDrives, setCurrentDrives] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data and set up real-time updates
  useEffect(() => {
    const loadData = async () => {
      // setIsLoading(true);
      try {
        const drives = await getCurrentDrives();
        setCurrentDrives(drives);
      } catch (error) {
        console.error('Error loading drives:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Set up periodic refresh to sync with admin updates
    // const refreshInterval = setInterval(loadData, 30000); // Refresh every 30 seconds

    /**
     * Real-time Update Listener
     * 
     * Listens for admin panel updates and immediately reflects changes
     * in the banner without requiring page refresh.
     */
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.section === 'currentDrives') {
        const updatedDrives = event.detail.data.filter((drive: any) => 
          drive.status === 'upcoming' && drive.registrationOpen
        );
        setCurrentDrives(updatedDrives);
        // Reset index if current drive was removed
        if (currentIndex >= updatedDrives.length) {
          setCurrentIndex(0);
        }
      }
    };

    window.addEventListener('adminDataUpdate', handleUpdate as EventListener);
    
    return () => {
      window.removeEventListener('adminDataUpdate', handleUpdate as EventListener);
      // clearInterval(refreshInterval);
    };
  }, [currentIndex]);

  // Auto-rotation functionality
  useEffect(() => {
    if (currentDrives.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % currentDrives.length);
      }, 5000); // Rotate every 5 seconds
      return () => clearInterval(timer);
    }
  }, [currentDrives.length]);

  /**
   * Date Calculation Helper
   * 
   * Calculates days until event date with proper timezone handling
   * to fix the server/client date mismatch warning.
   */
  const getDaysUntil = (dateString: string) => {
    try {
      const eventDate = new Date(dateString + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to avoid timezone issues
      
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch (error) {
      console.error('Error calculating days until event:', error);
      return 0;
    }
  };

  /**
   * Date Formatting Helper
   * 
   * Formats date consistently for both server and client to prevent
   * hydration mismatches.
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  /**
   * Difficulty Color Helper
   * 
   * Returns appropriate color classes for different difficulty levels.
   */
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Challenging': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Don't render if no drives available
  if (isLoading || !currentDrives.length) {
    return null;
  }

  const currentDrive = currentDrives[currentIndex];
  const daysUntil = getDaysUntil(currentDrive.date);

  return (
    <div className="bg-white dark:bg-gray-800/20 backdrop-blur-md rounded-lg shadow-lg relative overflow-hidden p-3">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-10 animate-bounce">
          {/* <Bike className="h-6 w-6" /> */}
        </div>
        <div className="absolute top-2 right-20 animate-pulse">
          {/* <TreePine className="h-5 w-5" /> */}
        </div>
        <div className="absolute bottom-2 left-1/4 animate-bounce" style={{ animationDelay: '1s' }}>
          {/* <Bike className="h-4 w-4" /> */}
        </div>
        <div className="absolute bottom-2 right-1/3 animate-pulse" style={{ animationDelay: '2s' }}>
          {/* <TreePine className="h-6 w-6" /> */}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Drive Logo and Status */}
            <div className="flex items-center space-x-3">
              <div className="relative p-2 bg-white/0 rounded-full">
                {currentDrive.logo ? (
                  <Image
                    src={currentDrive.logo}
                    alt="Drive Logo"
                    width={75}
                    height={75}
                    className="rounded-full/25 object-cover align-center"
                  />
                ) : (
                  <Bike className="mr-1" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">Save Earth Ride</span>
                {daysUntil <= 3 && (
                  <Badge className="animate-pulse flex items-center space-x-1 text-xs font-semibold px-2 py-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                )}
                {/* Difficulty Badge */}
                {currentDrive.difficulty && (
                  <Badge className={getDifficultyColor(currentDrive.difficulty)}>
                    {currentDrive.difficulty}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="hidden md:block w-px h-8 bg-white/30"></div>
            
            {/* Drive Information */}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1 line-clamp-1">{currentDrive.title}</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{currentDrive.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(currentDrive.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {daysUntil <0 ? 'Drive Completed':
                     daysUntil === 0 ? 'Today!' : 
                     daysUntil === 1 ? 'Tomorrow!' : 
                     `${daysUntil} days to go`}
                  </span>
                </div>
                {/* Additional info for larger screens */}
                {currentDrive.organizer && (
                  <div className="hidden lg:flex items-center space-x-1">
                    <span className="text-gray-500">by</span>
                    <span className="font-medium">{currentDrive.organizer}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats and CTA */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{currentDrive.participants || 0}</div>
                <div className="text-gray/80 dark:text-white/80">Riders</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{currentDrive.treesTarget || 0}</div>
                <div className="text-gray/80 dark:text-white/80">Trees Target</div>
              </div>
              {/* Duration display */}
              {currentDrive.duration && (
                <div className="text-center">
                  <div className="font-bold text-lg">{currentDrive.duration}</div>
                  <div className="text-gray/80 dark:text-white/80">Duration</div>
                </div>
              )}
            </div>
            
            <Link href="/register">
              <Button 
                size="sm" 
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold transition-all duration-200 hover:scale-105"
              >
                Join Ride
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Indicators for Multiple Drives */}
        {currentDrives.length > 1 && (
          <div className="flex justify-center space-x-2 mt-3 text-xs text-white/70 dark:text-white/50">
            {currentDrives.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'bg-green-600 w-6 dark:bg-blue-600 hover:bg-green-600 dark:hover:bg-blue-600 hover:w-6' : 'bg-blue-600 dark:bg-green-600 hover:bg-blue-600 dark:hover:bg-green-600 hover:w-6'
                }`}
                aria-label={`Go to drive ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}