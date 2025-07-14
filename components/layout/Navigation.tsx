'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, TreePine, Users, Calendar, BookOpen, MapPin, Heart, UserPlus, Handshake, Bike, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

/**
 * Navigation Menu Items Configuration
 * 
 * This array defines all navigation items with their routes and icons.
 * Easy to modify for adding/removing navigation items.
 * Icons are from lucide-react for consistency and performance.
 */
const navigation = [
  { name: 'Home', href: '/', icon: TreePine },
  { name: 'Gallery', href: '/gallery', icon: Users },
  { name: 'Timeline', href: '/timeline', icon: Calendar },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'Map', href: '/map', icon: MapPin },
  { name: 'Sponsors', href: '/sponsors', icon: Handshake },
  { name: 'Register', href: '/register', icon: UserPlus },
  { name: 'Donate', href: '/donate', icon: Heart },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  /**
   * Professional Theme Toggle Function
   * 
   * Switches between light and dark themes with smooth transitions.
   * Uses next-themes for persistent storage and system preference detection.
   * Provides immediate visual feedback with proper icon transitions.
   */
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        {/* 
          Enhanced Logo Section with Custom Logo
          
          Features:
          - Larger logo size (75x75) for better visibility
          - Reduced text size to balance proportions
          - Animated pulse indicator for brand recognition
          - Professional gradient text treatment
          - Bike icon animation for brand personality
        */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative">
            <Image
              src="/Biking_community_india.jpg"
              alt="Save Earth Ride Logo"
              width={70}
              height={70}
              className="rounded-full border-2 border-primary/20 shadow-sm h-16 w-16 obejct-cover"
              priority
            />
            {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div> */}
          </div>
          <span className="text-lg font-bold  bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:bg-gradient-to-r dark:from-blue-400 dark:via-purple-400 dark:to-green-400 bg-clip-text text-transparent ">
             Biking Community Of India
          </span>
          {/* <Bike className="h-5 w-5 text-blue-600 animate-pulse" /> */}
        </Link>

        {/* 
          Desktop Navigation with Reduced Spacing
          
          Features:
          - Compact spacing (space-x-2) for better layout
          - Professional hover effects with smooth transitions
          - Active state indicators with gradient underlines
          - Icon + text combination for better UX
          - Consistent styling across all navigation items
        */}
        <div className="hidden md:flex items-center space-x-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-200 hover:text-primary relative group flex items-center space-x-1 px-3 py-2 rounded-md",
                  pathname === item.href
                    ? "text-primary bg-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
                {/* Professional active indicator */}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 group-hover:w-full transition-all duration-300"></div>
              </Link>
            );
          })}
          
          {/* 
            Professional Dark Mode Toggle
            
            Features:
            - Smooth icon transitions with proper rotation
            - Professional border and background styling
            - Accessible with screen reader support
            - Consistent with overall design system
            - Immediate visual feedback on interaction
          */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-md  bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* 
          Mobile Navigation
          
          Features:
          - Theme toggle button for mobile users
          - Hamburger menu with slide-out sheet
          - Consistent styling with desktop version
          - Touch-friendly button sizes
          - Proper accessibility support
        */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-md border border-border/40 bg-background hover:bg-accent"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 text-sm font-medium transition-colors hover:text-primary p-3 rounded-lg",
                        pathname === item.href
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}