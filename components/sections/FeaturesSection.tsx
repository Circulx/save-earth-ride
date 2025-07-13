import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TreePine, Camera, Calendar, MapPin, Users, Heart } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Camera,
    title: 'Photo Gallery',
    description: 'Browse stunning photos from rides around the world. Filter by location, year, and event type.',
    link: '/gallery',
    buttonText: 'View Gallery',
  },
  {
    icon: Calendar,
    title: 'Event Timeline',
    description: 'Explore our journey through an interactive timeline of events, rides, and tree plantation drives.',
    link: '/timeline',
    buttonText: 'View Timeline',
  },
  {
    icon: MapPin,
    title: 'Interactive Map',
    description: 'Discover ride locations worldwide with our interactive map. Find events near you.',
    link: '/map',
    buttonText: 'Explore Map',
  },
  {
    icon: Users,
    title: 'Join Community',
    description: 'Register as an individual rider or motorcycle club. Connect with fellow environmental warriors.',
    link: '/register',
    buttonText: 'Join Now',
  },
  {
    icon: TreePine,
    title: 'Tree Planting',
    description: 'Participate in organized tree planting events and track your environmental impact.',
    link: '/timeline',
    buttonText: 'Get Involved',
  },
  {
    icon: Heart,
    title: 'Support the Cause',
    description: 'Make a donation to support our environmental initiatives and tree planting programs.',
    link: '/donate',
    buttonText: 'Donate Now',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background ">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white-600 mb-4">
            Explore Our Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover all the ways you can connect, contribute, and make a difference in our global environmental movement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="card-hover border-0 shadow-lg group">
                <CardContent className="p-8">
                  <div className = "bg-background/10 dark:bg-gray-800/100 rounded-2xl px-4 py-6 text-gray-900 dark:text-white rounded-lg shadow-md transition-transform transform group-hover:scale-105">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                    <Link href={feature.link}>
                      <Button className="mt-4 w-full group-hover:bg-primary/90 transition-colors">
                        {feature.buttonText}
                      </Button>
                    </Link>
                  </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}