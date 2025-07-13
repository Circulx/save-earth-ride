import { Card, CardContent } from '@/components/ui/card';
import { TreePine, Users, Globe, Shield } from 'lucide-react';

const features = [
  {
    icon: TreePine,
    title: 'Environmental Impact',
    description: 'Every ride plants trees and raises awareness about climate change and environmental conservation.',
  },
  {
    icon: Users,
    title: 'Global Community',
    description: 'Connect with like-minded bikers from around the world who share your passion for riding and nature.',
  },
  {
    icon: Globe,
    title: 'Worldwide Reach',
    description: 'Our movement spans across 156 countries, creating a truly global network of environmental warriors.',
  },
  {
    icon: Shield,
    title: 'Sustainable Future',
    description: 'Together, we\'re building a sustainable future for the next generation through responsible action.',
  },
];

export function AboutSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            About Save Earth Ride
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Save Earth Ride is more than just a biking community—we're a global movement dedicated to environmental conservation. 
            Founded on the belief that every individual can make a difference, we unite bikers worldwide to plant trees, 
            raise awareness, and protect our planet for future generations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="card-hover border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="container mx-auto px-4">
        <div className="bg-background/10 dark:bg-gray-800/100 backdrop-blur-md text-gray-900 dark:text-white rounded-2xl p-12 text-center ">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 ">
            Our Mission
          </h3>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            To create a sustainable future by uniting the global biking community in environmental conservation efforts, 
            one ride and one tree at a time. We believe that through collective action, we can make a lasting positive impact on our planet.
          </p>
        </div>
      </div>
      </div>
    </section>
  );
}