'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, TreePine, Users, Globe, CreditCard, Shield } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const donationAmounts = [25, 50, 100, 250, 500, 1000];

const currencies = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
];

const projects = [
  {
    id: 'general',
    name: 'General Fund',
    description: 'Support all our environmental initiatives',
    icon: Globe,
    color: 'text-green-600',
  },
  {
    id: 'trees',
    name: 'Tree Planting',
    description: 'Direct funding for tree plantation programs',
    icon: TreePine,
    color: 'text-green-700',
  },
  {
    id: 'community',
    name: 'Community Events',
    description: 'Organize environmental awareness events',
    icon: Users,
    color: 'text-blue-600',
  },
];

// Define the Donation type if not already defined
interface Donation {
  id: string;
  donationDate: string;
  donorName: string;
  email: string;
  phone: string;
  address: string;
  amount: number;
  currency: string;
  project: string;
  donationType: string;
  status: string;
  paymentMethod: string;
  transactionId: string;
  isAnonymous: boolean;
  treesEquivalent: number;
  co2Offset: number;
  communitiesHelped: number;
}

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);
  const [selectedProject, setSelectedProject] = useState('general');
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [isProcessing, setIsProcessing] = useState(false);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    anonymous: false
  });

  const getCurrentGoal = () => {
    const raised = 47850;
    const goal = 100000;
    const percentage = (raised / goal) * 100;
    return { raised, goal, percentage };
  };

  const goal = getCurrentGoal();

  /**
   * Excel Storage Function for Donations
   * 
   * This function saves donation data to both localStorage and Excel file.
   * The Excel file is automatically downloaded for admin access.
   * In production, this would be replaced with API calls to MongoDB.
   * 
   * Features:
   * - Comprehensive donation tracking with all details
   * - Automatic Excel file generation and download
   * - Real-time admin dashboard updates
   * - Currency conversion tracking
   * - Anonymous donation support
   */
  const saveDonationToExcel = async (donationData: any) => {
    try {
      // Load existing donations from localStorage
      const existingDonations = JSON.parse(localStorage.getItem('donations') || '[]');
      
      // Create comprehensive donation record
      const newDonation = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        donationDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        donorName: donationData.anonymous ? 'Anonymous' : donationData.name,
        email: donationData.email,
        phone: donationData.phone,
        address: donationData.address,
        amount: donationData.amount,
        currency: donationData.currency,
        project: donationData.project,
        donationType: donationData.type,
        status: 'Completed',
        paymentMethod: 'Razorpay',
        transactionId: `TXN_${Date.now()}`,
        isAnonymous: donationData.anonymous,
        // Calculate impact metrics
        treesEquivalent: Math.floor(donationData.amount / 5),
        co2Offset: Math.floor(donationData.amount * 0.5),
        communitiesHelped: Math.floor(donationData.amount / 25)
      };
      
      // Add to existing donations (newest first)
      existingDonations.unshift(newDonation);
      
      // Keep only last 1000 donations to prevent excessive storage
      if (existingDonations.length > 1000) {
        existingDonations.splice(1000);
      }
      
      // Save to localStorage for persistence
      localStorage.setItem('donations', JSON.stringify(existingDonations));
      
      // Create comprehensive Excel file with all donation data
      const excelData = (existingDonations as Donation[]).map((donation: Donation) => ({
        'Donation ID': donation.id,
        'Date': donation.donationDate,
        'Donor Name': donation.donorName,
        'Email': donation.email,
        'Phone': donation.phone,
        'Address': donation.address,
        'Amount': donation.amount,
        'Currency': donation.currency,
        'Project': donation.project,
        'Type': donation.donationType,
        'Status': donation.status,
        'Payment Method': donation.paymentMethod,
        'Transaction ID': donation.transactionId,
        'Anonymous': donation.isAnonymous ? 'Yes' : 'No',
        'Trees Equivalent': donation.treesEquivalent,
        'CO2 Offset (kg/year)': donation.co2Offset,
        'Communities Helped': donation.communitiesHelped
      }));
      
      // Generate and download Excel file
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Donations');
      
      // Auto-fit column widths for better readability
      const colWidths = [
        { wch: 15 }, // Donation ID
        { wch: 12 }, // Date
        { wch: 20 }, // Donor Name
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 30 }, // Address
        { wch: 10 }, // Amount
        { wch: 8 },  // Currency
        { wch: 15 }, // Project
        { wch: 10 }, // Type
        { wch: 10 }, // Status
        { wch: 15 }, // Payment Method
        { wch: 20 }, // Transaction ID
        { wch: 10 }, // Anonymous
        { wch: 12 }, // Trees Equivalent
        { wch: 15 }, // CO2 Offset
        { wch: 15 }  // Communities Helped
      ];
      ws['!cols'] = colWidths;
      
      XLSX.writeFile(wb, `donations_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      // Update recent donations for admin dashboard
      const recentDonations = existingDonations.slice(0, 5).map((d: Donation) => ({
        id: d.id,
        name: d.donorName,
        amount: d.amount,
        currency: d.currency,
        date: d.donationDate
      }));
      localStorage.setItem('recentDonations', JSON.stringify(recentDonations));
      
      // Trigger real-time update for admin dashboard
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adminDataUpdate', { 
          detail: { section: 'donations', data: recentDonations } 
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving donation:', error);
      throw new Error('Failed to save donation data');
    }
  };

  const handleDonate = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    // Comprehensive validation
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    if (!donorInfo.name.trim() || !donorInfo.email.trim()) {
      toast.error('Please provide your name and email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(donorInfo.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsProcessing(true);
    
    try {
      const donationData = {
        amount,
        currency: selectedCurrency.code,
        project: selectedProject,
        type: donationType,
        ...donorInfo
      };

      // Save donation to Excel with comprehensive tracking
      await saveDonationToExcel(donationData);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Thank you for your ${selectedCurrency.symbol}${amount} donation!`);
      
      // Reset form for potential new donation
      setSelectedAmount(null);
      setCustomAmount('');
      setDonorInfo({
        name: '',
        email: '',
        phone: '',
        address: '',
        anonymous: false
      });
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getConvertedAmount = (amount: number) => {
    // In a real app, this would use a currency conversion API
    const exchangeRates: { [key: string]: number } = {
      INR: 83,
      USD: 1,
      EUR: 0.85,
      GBP: 0.73,
      CAD: 1.25,
      AUD: 1.35,
      JPY: 110,
      BRL: 5.2,
    };
    
    const converted = amount * exchangeRates[selectedCurrency.code];
    return Math.round(converted);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Support Our Mission
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Help us plant more trees, organize environmental events, and build a sustainable future for our planet.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Donation Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>Make a Donation</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Donor Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Donor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="donorName">Full Name *</Label>
                      <Input
                        id="donorName"
                        value={donorInfo.name}
                        onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})}
                        placeholder="Enter your full name"
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="donorEmail">Email Address *</Label>
                      <Input
                        id="donorEmail"
                        type="email"
                        value={donorInfo.email}
                        onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})}
                        placeholder="Enter your email"
                        className="bg-background"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="donorPhone">Phone Number</Label>
                      <Input
                        id="donorPhone"
                        value={donorInfo.phone}
                        onChange={(e) => setDonorInfo({...donorInfo, phone: e.target.value})}
                        placeholder="Enter your phone number"
                        className="bg-background"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={donorInfo.anonymous}
                        onChange={(e) => setDonorInfo({...donorInfo, anonymous: e.target.checked})}
                      />
                      <Label htmlFor="anonymous">Make this donation anonymous</Label>
                    </div>
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={selectedCurrency.code}
                    onValueChange={(value) => {
                      const currency = currencies.find(c => c.code === value);
                      if (currency) setSelectedCurrency(currency);
                    }}
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Donation Type */}
                <div className="space-y-2">
                  <Label>Donation Type</Label>
                  <RadioGroup
                    value={donationType}
                    onValueChange={(value) => setDonationType(value as 'one-time' | 'monthly')}
                    className="flex space-x-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="one-time" id="one-time" />
                      <Label htmlFor="one-time">One-time</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Amount Selection */}
                <div className="space-y-4">
                  <Label>Donation Amount</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {donationAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === getConvertedAmount(amount) ? "default" : "outline"}
                        onClick={() => {
                          setSelectedAmount(getConvertedAmount(amount));
                          setCustomAmount('');
                        }}
                        className="h-12"
                      >
                        {selectedCurrency.symbol}{getConvertedAmount(amount)}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">Custom Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        {selectedCurrency.symbol}
                      </span>
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedAmount(null);
                        }}
                        className="pl-8 bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Selection */}
                <div className="space-y-4">
                  <Label>Choose Project</Label>
                  <RadioGroup
                    value={selectedProject}
                    onValueChange={setSelectedProject}
                    className="space-y-3"
                  >
                    {projects.map((project) => {
                      const Icon = project.icon;
                      return (
                        <div key={project.id} className="flex items-center space-x-3">
                          <RadioGroupItem value={project.id} id={project.id} />
                          <Label htmlFor={project.id} className="flex items-center space-x-3 cursor-pointer">
                            <Icon className={`h-5 w-5 ${project.color}`} />
                            <div>
                              <div className="font-medium">{project.name}</div>
                              <div className="text-sm text-muted-foreground">{project.description}</div>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Donation Button */}
                <Button
                  onClick={handleDonate}
                  disabled={isProcessing || (!selectedAmount && !customAmount) || !donorInfo.name || !donorInfo.email}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    'Processing...'
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Donate {selectedCurrency.symbol}{selectedAmount || customAmount}
                      {donationType === 'monthly' && '/month'}
                    </>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secured by Razorpay - Your donation is safe and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Goal */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Current Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${goal.raised.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      raised of ${goal.goal.toLocaleString()} goal
                    </div>
                  </div>
                  <Progress value={goal.percentage} className="h-3" />
                  <div className="text-center text-sm text-muted-foreground">
                    {Math.round(goal.percentage)}% complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impact Calculator */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-medium">
                      {selectedCurrency.symbol}{selectedAmount || customAmount || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">donation can provide</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trees planted</span>
                      <Badge variant="outline">
                        {Math.floor((selectedAmount || parseFloat(customAmount) || 0) / 5)} trees
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">CO2 offset</span>
                      <Badge variant="outline">
                        {Math.floor((selectedAmount || parseFloat(customAmount) || 0) * 0.5)} kg/year
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Communities helped</span>
                      <Badge variant="outline">
                        {Math.floor((selectedAmount || parseFloat(customAmount) || 0) / 25)} communities
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donors */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Recent Supporters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Anonymous</span>
                    <span className="text-sm font-medium">₹8,300</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Maria S.</span>
                    <span className="text-sm font-medium">₹4,150</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">John D.</span>
                    <span className="text-sm font-medium">₹2,075</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Riders Club</span>
                    <span className="text-sm font-medium">₹20,750</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}