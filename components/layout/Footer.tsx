import Link from 'next/link';
import { TreePine, Facebook, Instagram, Twitter, Youtube, Mail, Bike } from 'lucide-react';


export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 dark:bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TreePine className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Save Earth Ride</span>
              {/* <Bike className="h-5 w-5 text-blue-400 animate-pulse" /> */}
            </div>
            <p className="text-gray-400 text-sm">
              Uniting bikers worldwide to plant trees and protect our planet for future generations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/gallery" className="text-gray-400 hover:text-white transition-colors">Gallery</Link></li>
              <li><Link href="/timeline" className="text-gray-400 hover:text-white transition-colors">Timeline</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/map" className="text-gray-400 hover:text-white transition-colors">Map</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="text-gray-400 hover:text-white transition-colors">Join Us</Link></li>
              <li><Link href="/sponsors" className="text-gray-400 hover:text-white transition-colors">Sponsors</Link></li>
              <li><Link href="/donate" className="text-gray-400 hover:text-white transition-colors">Donate</Link></li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <Link href="https://www.facebook.com/saveearthride"  target="_blank" rel="noopener noreferrer">
                <Facebook className="text-gray-400 hover:text-white transition-colors h-5 w-5" />
              </Link>
              
              <Link href="https://www.instagram.com/saveearthride" target="_blank" rel="noopener noreferrer">
              <Instagram className="text-gray-400 hover:text-white transition-colors h-5 w-5" />
              </Link>

              <Link href="https://www.twitter.com/saveearthride" target="_blank" rel="noopener noreferrer">
                <Twitter className="text-gray-400 hover:text-white transition-colors h-5 w-5" />
              </Link>

              <Link href="https://www.youtube.com/@saveearthride" target="_blank" rel="noopener noreferrer">
              <Youtube className="text-gray-400 hover:text-white transition-colors h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400 text-gray-400 hover:text-white transition-colors">
              <Link href="mailto:" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>info@saveearthride.com</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Save Earth Ride. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}