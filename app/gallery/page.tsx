'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, MapPin, Bike, Camera, ArrowLeft, RefreshCw, AlertCircle, Image } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  location: string;
  city: string;
  year: string;
  tags: string[];
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * API Data Loader with Location Filtering
 * 
 * Loads gallery data from the API endpoint and supports filtering by location.
 * This ensures the gallery always shows the latest data from Google Sheets.
 */
const getGalleryData = async (): Promise<GalleryItem[]> => {
  try {
    const response = await fetch('/api/gallery', {
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch gallery data');
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Data validation: ensure all items have required fields
      return result.data.filter((item: any) => 
        item.title && 
        item.location && 
        item.city && 
        item.year && 
        item.image
      );
    } else {
      throw new Error(result.error || 'Failed to load gallery data');
    }
  } catch (error) {
    console.error('Error loading gallery data:', error);
    throw error;
  }
};

/**
 * Location-based Filtering Function
 * 
 * Filters photos based on city and country parameters from URL.
 * Supports flexible matching for different location formats.
 */
const filterPhotosByLocation = (photos: GalleryItem[], city?: string, country?: string) => {
  if (!city && !country) return photos;
  
  return photos.filter(photo => {
    const cityMatch = !city || photo.city.toLowerCase().includes(city.toLowerCase());
    const countryMatch = !country || photo.location.toLowerCase().includes(country.toLowerCase());
    return cityMatch && countryMatch;
  });
};

/**
 * Group Photos by Year with Location Context
 * 
 * Organizes photos by year in descending order (newest first).
 * Maintains location context for filtered views.
 */
const groupPhotosByYear = (photos: GalleryItem[]) => {
  const grouped = photos.reduce((acc, photo) => {
    if (!acc[photo.year]) {
      acc[photo.year] = [];
    }
    acc[photo.year].push(photo);
    return acc;
  }, {} as Record<string, GalleryItem[]>);

  // Sort photos within each year by title
  Object.keys(grouped).forEach(year => {
    grouped[year].sort((a, b) => a.title.localeCompare(b.title));
  });

  return grouped;
};

interface GalleryImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
}

export function GalleryImage({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc,
  onError 
}: GalleryImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.error('Failed to load image:', currentSrc);
    setImageError(true);
    setIsLoading(false);
    
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setImageError(false);
      setIsLoading(true);
    } else {
      onError?.();
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700`}>
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Image failed to load
          </p>
          <p className="text-xs text-gray-400 mt-1 break-all">
            {src}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse`}>
          <Image className="h-12 w-12 text-gray-400" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );}

export default function GalleryPage() {
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<GalleryItem[]>([]);
  const [groupedPhotos, setGroupedPhotos] = useState<Record<string, GalleryItem[]>>({});
  const [locationFilter, setLocationFilter] = useState<{city?: string, country?: string}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  /**
   * Data Loading and URL Parameter Processing
   * 
   * Loads initial data from API, processes URL parameters for location filtering,
   * and sets up real-time updates from admin panel.
   */
  useEffect(() => {
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getGalleryData();
      setGalleryData(data);
      
      // Process URL parameters for location filtering
      const city = searchParams.get('city');
      const country = searchParams.get('country');
      
      if (city || country) {
        setLocationFilter({ city: city || undefined, country: country || undefined });
        const filtered = filterPhotosByLocation(data, city || undefined, country || undefined);
        setFilteredPhotos(filtered);
        setGroupedPhotos(groupPhotosByYear(filtered));
      } else {
        setLocationFilter({});
        setFilteredPhotos(data);
        setGroupedPhotos(groupPhotosByYear(data));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery data');
      console.error('Error loading gallery data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manual Refresh Function
   * 
   * Allows users to manually refresh the gallery data.
   */
  const handleRefresh = () => {
    loadData();
  };

  /**
   * Clear Location Filter
   * 
   * Removes location-based filtering and shows all photos.
   */
  const clearLocationFilter = () => {
    setLocationFilter({});
    setFilteredPhotos(galleryData);
    setGroupedPhotos(groupPhotosByYear(galleryData));
    router.push('/gallery');
  };

  // Get years in descending order (newest first)
  const years = Object.keys(groupedPhotos).sort((a, b) => b.localeCompare(a));

  /**
   * Location Display Helper
   * 
   * Creates a readable location string for the filter display.
   */
  const getLocationDisplayName = () => {
    if (locationFilter.city && locationFilter.country) {
      return `${locationFilter.city}, ${locationFilter.country}`;
    } else if (locationFilter.city) {
      return locationFilter.city;
    } else if (locationFilter.country) {
      return locationFilter.country;
    }
    return '';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-green-500 dark:text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-300">Loading gallery...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
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
        {/* Enhanced Header with Location Context */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Camera className="h-12 w-12 text-green-500 dark:text-blue-500" />
            </div>
          </div>
          
          {/* Dynamic Title Based on Filter */}
          {locationFilter.city || locationFilter.country ? (
            <div className="space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Photos from {getLocationDisplayName()}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Explore environmental adventures and conservation efforts from this location across different years.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button 
                  onClick={clearLocationFilter}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>View All Photos</span>
                </Button>
                <Badge variant="secondary" className="text-sm">
                  {filteredPhotos.length} photos found
                </Badge>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Photo Gallery
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Explore stunning photos from our global community of riders making a difference around the world. Every image tells a story of environmental action and adventure.
              </p>
              <div className="flex items-center justify-center">
                <Button onClick={handleRefresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Gallery
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Location-specific Information */}
        {(locationFilter.city || locationFilter.country) && filteredPhotos.length > 0 && (
          <div className="mb-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Environmental Impact in {getLocationDisplayName()}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{filteredPhotos.length}</div>
                  <div className="text-green-100">Photos Captured</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{years.length}</div>
                  <div className="text-blue-100">Years Active</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {new Set(filteredPhotos.map(item => item.title)).size}
                  </div>
                  <div className="text-purple-100">Unique Events</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Year-wise Photo Organization */}
        <div className="space-y-16">
          {years.map((year) => (
            <div key={year} className="space-y-8">
              {/* Year Header with Enhanced Context */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-full shadow-lg">
                  <Calendar className="h-6 w-6" />
                  <h2 className="text-3xl font-bold">{year}</h2>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {groupedPhotos[year].length} photos
                  </Badge>
                  {locationFilter.city || locationFilter.country ? (
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      from {getLocationDisplayName()}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Photos Grid for this Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {groupedPhotos[year].map((item) => (
                  <Dialog key={item.id}>
                    <DialogTrigger asChild>
                      <Card className="card-hover cursor-pointer border-0 shadow-xl group overflow-hidden">
                        <div className="inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                        <CardContent className="p-0 relative">
                          <div className="relative overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute top-4 right-4">
                              <Badge variant="secondary" className="bg-white/60 dark:bg-white/60 dark:text-gray-900 text-gray-900 shadow-lg">
                                {item.year}
                              </Badge>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="flex items-center space-x-2 text-sm">
                                <Bike className="h-4 w-4" />
                                <span>Click to view details</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-3">
                              <MapPin className="h-4 w-4" />
                              <span>{item.city}, {item.location}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(item.tags) ? item.tags.slice(0, 2).map((tag: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs border-green-200 text-green-700 dark:border-green-700 dark:text-green-400">
                                  {tag}
                                </Badge>
                              )) : null}
                              {Array.isArray(item.tags) && item.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs border-gray-200 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                                  +{item.tags.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    
                    {/* Enhanced Photo Detail Modal */}
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">{item.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-96 object-cover rounded-lg shadow-lg"
                        />
                        <div>
                          <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400 mb-4">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-5 w-5" />
                              <span className="text-lg">{item.city}, {item.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-5 w-5" />
                              <span className="text-lg">{item.year}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg leading-relaxed">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {Array.isArray(item.tags) ? item.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-sm border-green-200 text-green-700 dark:border-green-700 dark:text-green-400 px-3 py-1">
                                {tag}
                              </Badge>
                            )) : null}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* No Photos State */}
        {years.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <Camera className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto" />
            </div>
            {locationFilter.city || locationFilter.country ? (
              <div className="space-y-4">
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  No photos found for {getLocationDisplayName()}.
                </p>
                <Button onClick={clearLocationFilter} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  View All Photos
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  No photos available yet. Check back soon for amazing adventures!
                </p>
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Gallery
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Stats Section */}
        {!locationFilter.city && !locationFilter.country && galleryData.length > 0 && (
          <div className="mt-20 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h3 className="text-3xl font-bold mb-8 text-center">Gallery Journey Through Time</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{galleryData.length}</div>
                <div className="text-green-500 dark:text-blue-500">Total Photos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{years.length}</div>
                <div className="text-green-500 dark:text-blue-500">Years of Adventures</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {new Set(galleryData.map(item => item.location)).size}
                </div>
                <div className="text-green-500 dark:text-blue-500">Countries Featured</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {new Set(galleryData.map(item => item.city)).size}
                </div>
                <div className="text-green-500 dark:text-blue-500">Cities Covered</div>
              </div>
            </div>
            
            {/* Year-wise Breakdown */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xl font-semibold mb-4 text-center">Photos by Year</h4>
              <div className="flex flex-wrap justify-center gap-4">
                {years.map((year) => (
                  <div key={year} className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 text-center">
                    <div className="text-lg font-bold">{year}</div>
                    <div className="text-sm text-green-500 dark:text-blue-500">{groupedPhotos[year].length} photos</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}