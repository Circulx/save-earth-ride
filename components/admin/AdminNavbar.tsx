'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Flag, Calendar, Users, BookOpen, MapPin, Handshake, Shield, LogOut, Menu, Moon, Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/drives', label: 'Drives', icon: Flag },
  { href: '/admin/timeline', label: 'Timeline', icon: Calendar },
  { href: '/admin/gallery', label: 'Gallery', icon: Users },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/map', label: 'Map', icon: MapPin },
  { href: '/admin/sponsors', label: 'Sponsors', icon: Handshake },
  { href: '/admin/admins', label: 'Admins', icon: Shield },
  { href: '/', label: 'Website', icon: Users },
  { href: '/admin', label: '', icon: LogOut },
];

export default function AdminNavbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/50 shadow-lg">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        
        {/* Logo */}
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <Image
            src="/Biking_community_india.jpg"
            alt="Save Earth Ride Logo"
            width={64}
            height={64}
            className="rounded-full border-2 border-primary/20 shadow h-14 w-14 object-cover"
            priority
          />
          <span className="text-lg font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-blue-400 dark:via-purple-400 dark:to-green-400 bg-clip-text text-transparent">
            Admin Dashboard
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <span
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  pathname === href
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </Link>
          ))}

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="ml-2 h-9 w-9 rounded-md bg-background hover:bg-accent"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle Theme</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center space-x-2 md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[300px] pt-6">
              <div className="flex flex-col gap-3">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                      pathname === href
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
