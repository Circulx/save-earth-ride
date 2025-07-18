'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExternalLink, Award, Star, Handshake, Bike, Building, Send, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Default/fallback sponsors data
const defaultSponsorsData = [
  {
    id: 1,
    name: 'EcoRide Motors',
    logo: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=200',
    tier: 'Platinum',
    website: 'https://ecoride.com',
    description: 'Leading manufacturer of eco-friendly motorcycles and electric bikes. Committed to sustainable transportation solutions.',
    contribution: 'Provides eco-friendly motorcycles for our rides and sponsors 1000 trees annually.',
    since: '2022',
    category: 'Automotive',
    type: 'sponsor'
  },
  {
    id: 2,
    name: 'GreenTech Solutions',
    logo: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=200',
    tier: 'Gold',
    website: 'https://greentech.com',
    description: 'Technology company focused on environmental solutions and carbon footprint reduction.',
    contribution: 'Sponsors our mobile app development and provides GPS tracking devices for rides.',
    since: '2023',
    category: 'Technology',
    type: 'sponsor'
  },
  {
    id: 3,
    name: 'Global Riders Alliance',
    logo: 'https://images.pexels.com/photos/1005648/pexels-photo-1005648.jpeg?auto=compress&cs=tinysrgb&w=200',
    tier: '',
    website: 'https://globalriders.org',
    description: 'International network of motorcycle clubs promoting responsible riding and environmental awareness.',
    contribution: 'Strategic partnership for global event coordination and rider network expansion.',
    since: '2022',
    category: 'Non-Profit',
    type: 'partner'
  }
];

export default function SponsorsPage() {
  const [sponsorsData, setSponsorsData] = useState(defaultSponsorsData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  
  // Partner registration form state
  const [partnerForm, setPartnerForm] = useState({
    type: 'sponsor',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    category: '',
    description: '',
    contribution: '',
    proposedTier: '',
    message: ''
  });

  // Load sponsors data from Google Sheets
  const loadSponsorsData = async (showRefreshMessage = false) => {
    try {
      if (showRefreshMessage) {
        setIsRefreshing(true);
      }
      
      const response = await fetch('/api/sponsors', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sponsors data');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setSponsorsData(result.data);
        if (showRefreshMessage) {
          toast.success('Sponsors data refreshed successfully!');
        }
      } else {
        console.error('Error loading sponsors data:', result.error);
        toast.error('Failed to load latest sponsors data, showing cached version');
      }
    } catch (error) {
      console.error('Error loading sponsors data:', error);
      if (showRefreshMessage) {
        toast.error('Failed to refresh sponsors data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadSponsorsData();
  }, []);

  // Listen for real-time updates from admin panel
  useEffect(() => {
    const handleAdminUpdate = (event: any) => {
      if (event.detail.section === 'sponsors') {
        setSponsorsData(event.detail.data);
        toast.success('Sponsors data updated in real-time!');
      }
    };

    window.addEventListener('adminDataUpdate', handleAdminUpdate);
    return () => window.removeEventListener('adminDataUpdate', handleAdminUpdate);
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadSponsorsData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Manual refresh function
  const handleRefresh = () => {
    loadSponsorsData(true);
  };

  const sponsors = sponsorsData.filter((item: any) => item.type === 'sponsor');
  const partners = sponsorsData.filter((item: any) => item.type === 'partner');

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'Gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'Silver': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'Bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum': return <Award className="h-4 w-4" />;
      case 'Gold': return <Star className="h-4 w-4" />;
      case 'Silver': return <Bike className="h-4 w-4" />;
      case 'Bronze': return <Building className="h-4 w-4" />;
      default: return <Handshake className="h-4 w-4" />;
    }
  };

  // Handle partner registration form submission
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partnerForm.companyName || !partnerForm.contactPerson || !partnerForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create registration object
      const registration = {
        id: Date.now(),
        ...partnerForm,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };

      // In a real application, you would send this to your backend
      // For now, we'll simulate saving it
      console.log('Partnership registration:', registration);

      // Create downloadable file for admin
      const dataStr = JSON.stringify(registration, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `partner_registration_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Partnership application submitted successfully! We will contact you soon.');
      setIsPartnerFormOpen(false);
      setPartnerForm({
        type: 'sponsor',
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        category: '',
        description: '',
        contribution: '',
        proposedTier: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting partnership application:', error);
      toast.error('Failed to submit partnership application');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading sponsors data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Real Bike Background */}
      <div className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2396045/pexels-photo-2396045.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            filter: 'brightness(0.2)',  
          }}
        />
        <div className="absolute inset-0" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Handshake className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Our Sponsors & Partners
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            We're proud to collaborate with industry leaders and organizations who share our vision of environmental conservation and sustainable transportation.
          </p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8"
              onClick={() => setIsPartnerFormOpen(true)}
            >
              <Handshake className="h-5 w-5 mr-2" />
              Become a Partner
            </Button>
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Real-time Data Indicator */}
        {/* <div className="mb-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live data from Google Sheets • Updates every 30 seconds</span>
          </div>
        </div> */}

        {/* Sponsors Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Sponsors
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Companies that fuel our mission with their generous support
            </p>
            <div className="text-sm text-gray-500 mt-2">
              Currently showing {sponsors.length} active sponsors
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sponsors.map((sponsor: any) => (
              <Dialog key={sponsor.id}>
                <DialogTrigger asChild>
                  <Card className="card-hover cursor-pointer border-0 shadow-lg group relative overflow-hidden dark:bg-gray-800 transition-all duration-300 hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
                          />
                          {sponsor.tier && (
                            <div className="absolute -top-2 -right-2">
                              <Badge className={`${getTierColor(sponsor.tier)} text-xs px-2 py-1`}>
                                {getTierIcon(sponsor.tier)}
                                <span className="ml-1">{sponsor.tier}</span>
                              </Badge>
                            </div>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {sponsor.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {sponsor.category}
                        </Badge>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                          {sponsor.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Partner since {sponsor.since}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-2xl dark:bg-gray-800">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3 dark:text-white">
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span>{sponsor.name}</span>
                          {sponsor.tier && (
                            <Badge className={`${getTierColor(sponsor.tier)} text-xs`}>
                              {getTierIcon(sponsor.tier)}
                              <span className="ml-1">{sponsor.tier}</span>
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                          {sponsor.category} • Partner since {sponsor.since}
                        </div>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About</h4>
                      <p className="text-gray-600 dark:text-gray-300">{sponsor.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Contribution</h4>
                      <p className="text-gray-600 dark:text-gray-300">{sponsor.contribution}</p>
                    </div>
                    {sponsor.website && (
                      <div className="flex items-center space-x-4 pt-4">
                        <Button asChild>
                          <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Website
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>

        {/* Partners Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Strategic Partners
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Organizations we collaborate with to amplify our environmental impact
            </p>
            <div className="text-sm text-gray-500 mt-2">
              Currently showing {partners.length} active partners
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partners.map((partner: any) => (
              <Dialog key={partner.id}>
                <DialogTrigger asChild>
                  <Card className="card-hover cursor-pointer border-0 shadow-lg group dark:bg-gray-800 transition-all duration-300 hover:shadow-xl">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="w-16 h-16 mx-auto rounded-full object-cover border-2 border-gray-200"
                        />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                          {partner.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {partner.category}
                        </Badge>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                          {partner.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Since {partner.since}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="dark:bg-gray-800">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-3 dark:text-white">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div>{partner.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                          Partner since {partner.since}
                        </div>
                      </div>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">About</h4>
                      <p className="text-gray-600 dark:text-gray-300">{partner.description}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Partnership</h4>
                      <p className="text-gray-600 dark:text-gray-300">{partner.contribution}</p>
                    </div>
                    {partner.website && (
                      <div className="flex items-center space-x-4 pt-4">
                        <Button asChild variant="outline">
                          <a href={partner.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Website
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Registration Form Dialog */}
      <Dialog open={isPartnerFormOpen} onOpenChange={setIsPartnerFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 dark:text-white">
              <Building className="h-6 w-6 text-primary" />
              <span>Partnership Application</span>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handlePartnerSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Partnership Type *</Label>
                <Select onValueChange={(value) => setPartnerForm({...partnerForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                    <SelectItem value="partner">Strategic Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="companyName">Company/Organization Name *</Label>
                <Input
                  id="companyName"
                  value={partnerForm.companyName}
                  onChange={(e) => setPartnerForm({...partnerForm, companyName: e.target.value})}
                  placeholder="Enter company name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={partnerForm.contactPerson}
                  onChange={(e) => setPartnerForm({...partnerForm, contactPerson: e.target.value})}
                  placeholder="Enter contact person name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm({...partnerForm, email: e.target.value})}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm({...partnerForm, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={partnerForm.website}
                  onChange={(e) => setPartnerForm({...partnerForm, website: e.target.value})}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Industry/Category</Label>
                <Select onValueChange={(value) => setPartnerForm({...partnerForm, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Automotive">Automotive</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Energy">Energy</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {partnerForm.type === 'sponsor' && (
                <div>
                  <Label htmlFor="proposedTier">Proposed Sponsorship Tier</Label>
                  <Select onValueChange={(value) => setPartnerForm({...partnerForm, proposedTier: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Platinum">Platinum</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Silver">Silver</SelectItem>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Company Description</Label>
              <Textarea
                id="description"
                value={partnerForm.description}
                onChange={(e) => setPartnerForm({...partnerForm, description: e.target.value})}
                placeholder="Tell us about your company and its mission"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="contribution">Proposed Contribution</Label>
              <Textarea
                id="contribution"
                value={partnerForm.contribution}
                onChange={(e) => setPartnerForm({...partnerForm, contribution: e.target.value})}
                placeholder="How would you like to contribute to our environmental mission?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="message">Additional Message</Label>
              <Textarea
                id="message"
                value={partnerForm.message}
                onChange={(e) => setPartnerForm({...partnerForm, message: e.target.value})}
                placeholder="Any additional information you'd like to share"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPartnerFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}