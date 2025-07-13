'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExternalLink, Award, Star, Handshake, Bike, Building, Send } from 'lucide-react';
import { toast } from 'sonner';

// Load sponsors data from localStorage or use defaults
const getSponsorsData = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sponsorsData');
    if (saved) {
      return JSON.parse(saved);
    }
  }
  
  return [
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
};

export default function SponsorsPage() {
  const [selectedSponsor, setSelectedSponsor] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  const [sponsorsData] = useState(getSponsorsData());
  
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

  const sponsors = sponsorsData.filter((item: any) => item.type === 'sponsor');
  const partners = sponsorsData.filter((item: any) => item.type === 'partner');

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'Gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'Silver': return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum': return <Award className="h-4 w-4" />;
      case 'Gold': return <Star className="h-4 w-4" />;
      case 'Silver': return <Bike className="h-4 w-4" />;
      default: return <Handshake className="h-4 w-4" />;
    }
  };

  // Handle partner registration form submission
  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partnerForm.companyName || !partnerForm.contactPerson || !partnerForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Save to localStorage (in production, this would be sent to a server)
    const registrations = JSON.parse(localStorage.getItem('partnerRegistrations') || '[]');
    const newRegistration = {
      id: Date.now(),
      ...partnerForm,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    registrations.push(newRegistration);
    localStorage.setItem('partnerRegistrations', JSON.stringify(registrations));
    
    // Create downloadable file for admin
    const dataStr = JSON.stringify(newRegistration, null, 2);
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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Real Bike Background */}
      <div className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            filter: 'brightness(0.3)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-blue-600/80" />
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              <Handshake className="h-12 w-12 text-white" />
              {/* <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="h-3 w-3 text-white" />
              </div> */}
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6">
            Our Sponsors & Partners
          </h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed mb-8">
            We're proud to collaborate with industry leaders and organizations who share our vision of environmental conservation and sustainable transportation.
          </p>
          
          {/* Become Partner CTA */}
          <Button 
            size="lg" 
            className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8"
            onClick={() => setIsPartnerFormOpen(true)}
          >
            <Handshake className="h-5 w-5 mr-2" />
            Become a Partner
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Sponsors Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Sponsors
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Companies that fuel our mission with their generous support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sponsors.map((sponsor: any) => (
              <Dialog key={sponsor.id}>
                <DialogTrigger asChild>
                  <Card className="card-hover cursor-pointer border-0 shadow-lg group relative overflow-hidden dark:bg-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-6 relative z-10">
                      <div className="text-center space-y-4">
                        <div className="relative">
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-white shadow-lg"
                          />
                          <div className="absolute -top-2 -right-2">
                            <Badge className={`${getTierColor(sponsor.tier)} text-xs px-2 py-1`}>
                              {getTierIcon(sponsor.tier)}
                              <span className="ml-1">{sponsor.tier}</span>
                            </Badge>
                          </div>
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
                          <Badge className={`${getTierColor(sponsor.tier)} text-xs`}>
                            {getTierIcon(sponsor.tier)}
                            <span className="ml-1">{sponsor.tier}</span>
                          </Badge>
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
                    <div className="flex items-center space-x-4 pt-4">
                      <Button asChild>
                        <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visit Website
                        </a>
                      </Button>
                    </div>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {partners.map((partner: any) => (
              <Dialog key={partner.id}>
                <DialogTrigger asChild>
                  <Card className="card-hover cursor-pointer border-0 shadow-lg group dark:bg-gray-800">
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
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>

        {/* Call to Action with Bike Background */}
        {/* <div 
          className="relative rounded-2xl p-12 text-center text-white overflow-hidden"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=1200)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-blue-600/90 rounded-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-6">
              Become a Partner
            </h3>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join our mission to create a sustainable future. Partner with us to make a lasting environmental impact.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => setIsPartnerFormOpen(true)}
            >
              <Handshake className="h-5 w-5 mr-2" />
              Partner With Us
            </Button>
          </div>
        </div> */}
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