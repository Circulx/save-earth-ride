import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import NavbarSelector from '@/components/layout/NavbarSelector';

const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Save Earth Ride - Global Biker Community for Environmental Change',
  description: 'Join the global movement of bikers planting trees and protecting our planet. Connect with riders worldwide, participate in eco-friendly rides, and make a positive environmental impact.',
  keywords: 'biker community, tree planting, environmental awareness, motorcycle rides, sustainability, eco-friendly',
  icons: {
    icon: '/Biking_community_india.jpg',
    shortcut: '/Biking_community_india.jpg',
    apple: '/Biking_community_india.jpg',
  },
  openGraph: {
    title: 'Save Earth Ride - Global Biker Community',
    description: 'Join the global movement of bikers planting trees and protecting our planet.',
    url: 'https://saveearthride.com',
    siteName: 'Save Earth Ride',
    images: [
      {
        url: '/Biking_community_india.jpg',
        width: 1200,
        height: 630,
        alt: 'Save Earth Ride Community',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Save Earth Ride - Global Biker Community',
    description: 'Join the global movement of bikers planting trees and protecting our planet.',
    images: ['/Biking_community_india.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <div className="relative flex min-h-screen flex-col bg-background">
            <NavbarSelector />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
