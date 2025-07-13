import { Button } from '@/components/ui/button';
import { TreePine, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <TreePine className="h-16 w-16 mx-auto mb-8 text-green-200" />
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl md:text-2xl text-green-100 mb-12 max-w-2xl mx-auto">
            Join thousands of riders worldwide who are protecting our planet, one ride at a time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4">
                <Users className="h-5 w-5 mr-2" />
                Join the Movement
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/donate">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4">
                <TreePine className="h-5 w-5 mr-2" />
                Support Our Cause
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 text-green-200">
            <p className="text-lg">
              🌱 Every registration helps plant more trees • 🏍️ Every ride makes a difference
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}