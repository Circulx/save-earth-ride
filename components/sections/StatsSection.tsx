'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TreePine, Users, Globe, Calendar, Bike } from 'lucide-react';

export function StatsSection() {
  const [stats, setStats] = useState({
    trees: 25847,
    riders: 52340,
    countries: 156,
    events: 543
  });
  const [counters, setCounters] = useState([0, 0, 0, 0]);

  useEffect(() => {
    /**
     * Dynamic Stats Loading
     * 
     * Loads real-time data from admin-managed localStorage.
     * This ensures the stats always reflect current data.
     */
    const loadDynamicStats = () => {
      try {
        // Tree count from admin
        const treeCount = localStorage.getItem('treeCount');
        if (treeCount) {
          setStats(prev => ({ ...prev, trees: parseInt(treeCount) }));
        }

        // Gallery count for countries
        const galleryData = localStorage.getItem('galleryData');
        if (galleryData) {
          const gallery = JSON.parse(galleryData);
          const countries = new Set(gallery.map((item: any) => item.location)).size;
          setStats(prev => ({ ...prev, countries }));
        }

        // Timeline events count
        const timelineData = localStorage.getItem('timelineData');
        if (timelineData) {
          const timeline = JSON.parse(timelineData);
          setStats(prev => ({ ...prev, events: timeline.length }));
        }

        // Registrations count (approximate riders)
        const registrations = localStorage.getItem('registrations');
        if (registrations) {
          const regs = JSON.parse(registrations);
          setStats(prev => ({ ...prev, riders: 50000 + regs.length }));
        }

        // Donations count for additional metrics
        const donations = localStorage.getItem('donations');
        if (donations) {
          const donationData = JSON.parse(donations);
          // Could use this for additional stats if needed
        }
      } catch (error) {
        console.error('Error loading dynamic stats:', error);
      }
    };

    loadDynamicStats();

    /**
     * Real-time Update Listener
     * 
     * Listens for admin panel updates and immediately updates stats.
     */
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.section === 'treeCount') {
        setStats(prev => ({ ...prev, trees: event.detail.data }));
      } else if (event.detail.section === 'gallery') {
        const countries = new Set(event.detail.data.map((item: any) => item.location)).size;
        setStats(prev => ({ ...prev, countries }));
      } else if (event.detail.section === 'timeline') {
        setStats(prev => ({ ...prev, events: event.detail.data.length }));
      } else if (event.detail.section === 'registrations') {
        setStats(prev => ({ ...prev, riders: 50000 + event.detail.data.length }));
      }
    };

    window.addEventListener('adminDataUpdate', handleUpdate as EventListener);

    /**
     * Counter Animation
     * 
     * Animates the numbers from 0 to their target values for visual appeal.
     */
    const statsArray = [stats.trees, stats.riders, stats.countries, stats.events];
    const timers = statsArray.map((stat, index) => {
      const increment = Math.ceil(stat / 100);
      return setInterval(() => {
        setCounters(prev => {
          const newCounters = [...prev];
          if (newCounters[index] < stat) {
            newCounters[index] = Math.min(newCounters[index] + increment, stat);
          }
          return newCounters;
        });
      }, 50);
    });

    return () => {
      timers.forEach(clearInterval);
      window.removeEventListener('adminDataUpdate', handleUpdate as EventListener);
    };
  }, [stats.trees, stats.riders, stats.countries, stats.events]);

  const statsData = [
    {
      icon: TreePine,
      value: counters[0],
      label: 'Trees Planted',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconBg: 'bg-green-500',
    },
    {
      icon: Users,
      value: counters[1],
      label: 'Global Riders',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-500',
    },
    {
      icon: Globe,
      value: counters[2],
      label: 'Countries',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-500',
    },
    {
      icon: Calendar,
      value: counters[3],
      label: 'Events Organized',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconBg: 'bg-orange-500',
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            {/* <Bike className="h-8 w-8 text-primary animate-bounce" /> */}
            <h2 className="text-4xl font-bold text-foreground">
              Our Global Impact
            </h2>
            {/* <Bike className="h-8 w-8 text-blue-600 animate-bounce" style={{ animationDelay: '0.5s' }} /> */}
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Together, we're making a difference across the globe. Every ride counts, every tree matters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="card-hover border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${stat.bgColor} mb-6 relative`}>
                    <div className={`p-3 ${stat.iconBg} rounded-full`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    {/* {index === 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                    )} */}
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                  {index === 0 && (
                    <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                      {/* Live count updated by admin */}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Enhanced Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-background/10 dark:bg-gray-800/100 backdrop-blur-md rounded-2xl p-8 text-gray-900 dark:text-white">
            <div className="flex items-center justify-center space-x-4 mb-4">
              {/* <Bike className="h-10 w-10 animate-bounce" /> */}
              <h3 className="text-2xl font-bold">Join the Movement</h3>
              {/* <Bike className="h-10 w-10 animate-bounce" style={{ animationDelay: '0.5s' }} /> */}
            </div>
            <p className="text-lg text-green-400 dark:text-blue-300  mb-6">
              Be part of these growing numbers. Every rider makes a difference!
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <TreePine className="h-4 w-4" />
                <span>Plant trees while riding</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Connect with global riders</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Make worldwide impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}