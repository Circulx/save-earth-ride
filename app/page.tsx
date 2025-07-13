import { HeroSection } from '@/components/sections/HeroSection';
import { RunningBanner } from '@/components/sections/RunningBanner';
import { StatsSection } from '@/components/sections/StatsSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <RunningBanner />
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}