"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, TreePine, Bike, ArrowRight, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

/**
 * Current Drives Data Loader
 *
 * This function loads current drives from localStorage (admin-managed data).
 * In production, this would be replaced with API calls to MongoDB.
 *
 * @returns Array of current drive objects
 */
const getCurrentDrives = () => {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("currentDrives")
      if (saved) {
        const drives = JSON.parse(saved)
        // Data validation: ensure all drives have required fields
        return drives.filter(
          (drive: any) =>
            drive.title && drive.location && drive.date && drive.status === "upcoming" && drive.registrationOpen,
        )
      }
    } catch (error) {
      console.error("Error loading current drives:", error)
    }
  }

  // Fallback data if localStorage is empty or corrupted
  return [
    {
      id: 1,
      title: "New Year Green Resolution Ride",
      location: "Mumbai, India",
      date: "2025-01-01",
      participants: 150,
      treesTarget: 500,
      status: "upcoming",
      registrationOpen: true,
      description: "Start the new year with a green resolution! Join us for a massive tree planting drive.",
      organizer: "Mumbai Riders Club",
      logo: "/Save-earth-ride-logo.jpg",
    },
  ]
}

/**
 * Running Banner Component
 *
 * Displays upcoming drives in a rotating banner at the top of the homepage.
 * Features:
 * - Real-time updates from admin panel
 * - Auto-rotation every 5 seconds
 * - Responsive design for mobile/desktop
 * - Dark mode support
 * - Data validation and error handling
 */
export function RunningBanner() {
  const [currentDrives, setCurrentDrives] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Load initial data and set up real-time updates
  useEffect(() => {
    const loadData = () => {
      const drives = getCurrentDrives()
      setCurrentDrives(drives)
      setIsLoading(false)
    }

    loadData()

    /**
     * Real-time Update Listener
     *
     * Listens for admin panel updates and immediately reflects changes
     * in the banner without requiring page refresh.
     */
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.section === "currentDrives") {
        const updatedDrives = event.detail.data.filter(
          (drive: any) => drive.status === "upcoming" && drive.registrationOpen,
        )
        setCurrentDrives(updatedDrives)
        // Reset index if current drive was removed
        if (currentIndex >= updatedDrives.length) {
          setCurrentIndex(0)
        }
      }
    }

    window.addEventListener("adminDataUpdate", handleUpdate as EventListener)
    return () => window.removeEventListener("adminDataUpdate", handleUpdate as EventListener)
  }, [currentIndex])

  // Auto-rotation functionality
  useEffect(() => {
    if (currentDrives.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % currentDrives.length)
      }, 5000) // Rotate every 5 seconds
      return () => clearInterval(timer)
    }
  }, [currentDrives.length])

  /**
   * Date Calculation Helper
   *
   * Calculates days until event date with proper timezone handling
   * to fix the server/client date mismatch warning.
   */
  const getDaysUntil = (dateString: string) => {
    try {
      const eventDate = new Date(dateString + "T00:00:00")
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to avoid timezone issues

      const diffTime = eventDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return Math.max(0, diffDays)
    } catch (error) {
      console.error("Error calculating days until event:", error)
      return 0
    }
  }

  /**
   * Date Formatting Helper
   *
   * Formats date consistently for both server and client to prevent
   * hydration mismatches.
   */
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString + "T00:00:00")
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return dateString
    }
  }

  // Don't render if no drives available
  if (isLoading || !currentDrives.length) {
    return null
  }

  const currentDrive = currentDrives[currentIndex]
  const daysUntil = getDaysUntil(currentDrive.date)

  return (
    <div className="bg-white dark:bg-gray-800/20 backdrop-blur-md rounded-lg shadow-lg relative overflow-hidden p-2 sm:p-3 lg:p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-10 animate-bounce hidden lg:block">
          <Bike className="h-6 w-6" />
        </div>
        <div className="absolute top-2 right-20 animate-pulse hidden lg:block">
          <TreePine className="h-5 w-5" />
        </div>
        <div className="absolute bottom-2 left-1/4 animate-bounce hidden lg:block" style={{ animationDelay: "1s" }}>
          <Bike className="h-4 w-4" />
        </div>
        <div className="absolute bottom-2 right-1/3 animate-pulse hidden lg:block" style={{ animationDelay: "2s" }}>
          <TreePine className="h-6 w-6" />
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 relative z-10">
        {/* Mobile Layout */}
        <div className="block lg:hidden">
          <div className="flex flex-col space-y-3">
            {/* Top Row - Logo and Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  {currentDrive.logo ? (
                    <Image
                      src={currentDrive.logo || "/placeholder.svg"}
                      alt="Drive Logo"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Bike className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="text-sm font-bold truncate">Save Earth Ride</span>
                  {daysUntil <= 3 && (
                    <Badge className="animate-pulse text-xs px-1 py-0 flex-shrink-0">
                      <AlertCircle className="h-2 w-2 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
              </div>
              <Link href="/register" className="flex-shrink-0 ml-2">
                <Button
                  size="sm"
                  className="bg-white text-green-600 hover:bg-gray-100 text-xs px-3 py-1.5 whitespace-nowrap"
                >
                  Join Ride
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>

            {/* Event Title */}
            <div>
              <h3 className="text-base font-bold line-clamp-2 leading-tight">{currentDrive.title}</h3>
            </div>

            {/* Event Details */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{currentDrive.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="whitespace-nowrap">{formatDate(currentDrive.date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="whitespace-nowrap">
                  {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil} days`}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center space-x-8 text-xs">
              <div className="text-center">
                <div className="font-bold text-sm">{currentDrive.participants}</div>
                <div className="text-gray-600 dark:text-gray-400">Riders</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">{currentDrive.treesTarget}</div>
                <div className="text-gray-600 dark:text-gray-400">Trees</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tablet Layout */}
        <div className="hidden md:block lg:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              {/* Drive Logo and Status */}
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  {currentDrive.logo ? (
                    <Image
                      src={currentDrive.logo || "/placeholder.svg"}
                      alt="Drive Logo"
                      width={50}
                      height={50}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                      <Bike className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold">Save Earth Ride</span>
                  {daysUntil <= 3 && (
                    <Badge className="animate-pulse flex items-center space-x-1 text-xs font-semibold px-2 py-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  )}
                </div>
              </div>

              {/* Drive Information */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold mb-1 line-clamp-1">{currentDrive.title}</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{currentDrive.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{formatDate(currentDrive.date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil} days to go`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats and CTA */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-base">{currentDrive.participants}</div>
                  <div className="text-gray-600 dark:text-white/80">Riders</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-base">{currentDrive.treesTarget}</div>
                  <div className="text-gray-600 dark:text-white/80">Trees</div>
                </div>
              </div>

              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-white text-green-600 hover:bg-gray-100 font-semibold transition-all duration-200 hover:scale-105 whitespace-nowrap"
                >
                  Join Ride
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Drive Logo and Status */}
            <div className="flex items-center space-x-3">
              <div className="relative flex-shrink-0">
                {currentDrive.logo ? (
                  <Image
                    src={currentDrive.logo || "/placeholder.svg"}
                    alt="Drive Logo"
                    width={60}
                    height={60}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-15 h-15 bg-green-600 rounded-full flex items-center justify-center">
                    <Bike className="h-8 w-8 text-white" />
                  </div>
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
              </div>
            </div>

            <div className="hidden xl:block w-px h-8 bg-gray-300 dark:bg-white/30"></div>

            {/* Drive Information */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold mb-1 line-clamp-1">{currentDrive.title}</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{currentDrive.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{formatDate(currentDrive.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `${daysUntil} days to go`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and CTA */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="flex items-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{currentDrive.participants}</div>
                <div className="text-gray-600 dark:text-white/80">Riders</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{currentDrive.treesTarget}</div>
                <div className="text-gray-600 dark:text-white/80">Trees Target</div>
              </div>
            </div>

            <Link href="/register">
              <Button
                size="sm"
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold transition-all duration-200 hover:scale-105 whitespace-nowrap"
              >
                Join Ride
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Indicators for Multiple Drives */}
        {currentDrives.length > 1 && (
          <div className="flex justify-center space-x-2 mt-3 text-xs">
            {currentDrives.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-green-600 w-6 dark:bg-blue-600"
                    : "bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-700"
                }`}
                aria-label={`Go to drive ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
