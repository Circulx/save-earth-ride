'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, User, MapPin, Globe, Instagram, Facebook, Twitter, Bike, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

/**
 * Registration Form Validation Schemas
 * 
 * These schemas ensure data integrity and provide user feedback
 * for both individual and club registration forms.
 */
const clubSchema = z.object({
  type: z.literal('club'),
  clubName: z.string().min(2, 'Club name must be at least 2 characters'),
  adminName: z.string().min(2, 'Admin name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
});

const individualSchema = z.object({
  type: z.literal('individual'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(1, 'Country is required'),
  city: z.string().min(1, 'City is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters'),
  ridingExperience: z.string().min(1, 'Riding experience is required'),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
});

type FormData = z.infer<typeof clubSchema> | z.infer<typeof individualSchema>;

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 
  'Italy', 'Spain', 'Netherlands', 'Brazil', 'India', 'Japan', 'China', 'South Korea',
  'Mexico', 'Argentina', 'Colombia', 'Chile', 'Peru', 'South Africa', 'Nigeria',
  'Egypt', 'Morocco', 'Kenya', 'Ghana', 'Russia', 'Poland', 'Czech Republic',
  'Hungary', 'Romania', 'Greece', 'Turkey', 'Israel', 'UAE', 'Saudi Arabia',
  'Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Philippines', 'Indonesia',
  'New Zealand', 'Norway', 'Sweden', 'Denmark', 'Finland', 'Iceland', 'Ireland',
  'Portugal', 'Austria', 'Switzerland', 'Belgium', 'Luxembourg'
];

export default function RegisterPage() {
  const [registrationType, setRegistrationType] = useState<'club' | 'individual'>('individual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const schema = registrationType === 'club' ? clubSchema : individualSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: registrationType },
  });

  /**
   * Excel Storage Function for Registrations
   * 
   * This function saves registration data to both localStorage and Excel file.
   * The Excel file is automatically downloaded for admin access.
   * In production, this would be replaced with API calls to MongoDB.
   * 
   * Features:
   * - Automatic Excel file generation and download
   * - Data validation and error handling
   * - Real-time admin dashboard updates
   * - Persistent localStorage backup
   */
  const saveRegistrationToExcel = async (data: FormData) => {
    try {
      // Load existing registrations from localStorage
      const existingRegistrations = JSON.parse(localStorage.getItem('registrations') || '[]');
      
      // Create new registration record with comprehensive data
      const newRegistration = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        registrationDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }),
        name: data.type === 'club' ? data.clubName : `${data.firstName} ${data.lastName}`,
        type: data.type === 'club' ? 'Club' : 'Individual',
        location: `${data.city}, ${data.country}`,
        email: data.email,
        phone: data.phone,
        status: 'Active',
        // Store all form data for comprehensive records
        fullData: data
      };
      
      // Add to existing registrations (newest first)
      existingRegistrations.unshift(newRegistration);
      
      // Keep only last 1000 registrations to prevent excessive storage
      if (existingRegistrations.length > 1000) {
        existingRegistrations.splice(1000);
      }
      
      // Save to localStorage for persistence
      localStorage.setItem('registrations', JSON.stringify(existingRegistrations));
      
      // Create comprehensive Excel file with all registration data
      const excelData = existingRegistrations.map(reg => ({
        'Registration ID': reg.id,
        'Date': reg.registrationDate,
        'Name': reg.name,
        'Type': reg.type,
        'Email': reg.email,
        'Phone': reg.phone,
        'Location': reg.location,
        'Status': reg.status,
        'Country': reg.fullData?.country || '',
        'City': reg.fullData?.city || '',
        'Additional Info': reg.type === 'Club' ? 
          reg.fullData?.description || '' : 
          reg.fullData?.bio || '',
        'Experience': reg.fullData?.ridingExperience || 'N/A',
        'Website': reg.fullData?.website || '',
        'Social Media': [
          reg.fullData?.instagram ? `Instagram: ${reg.fullData.instagram}` : '',
          reg.fullData?.facebook ? `Facebook: ${reg.fullData.facebook}` : '',
          reg.fullData?.twitter ? `Twitter: ${reg.fullData.twitter}` : ''
        ].filter(Boolean).join(', ')
      }));
      
      // Generate and download Excel file
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registrations');
      
      // Auto-fit column widths for better readability
      const colWidths = [
        { wch: 15 }, // Registration ID
        { wch: 12 }, // Date
        { wch: 25 }, // Name
        { wch: 10 }, // Type
        { wch: 30 }, // Email
        { wch: 15 }, // Phone
        { wch: 25 }, // Location
        { wch: 10 }, // Status
        { wch: 15 }, // Country
        { wch: 15 }, // City
        { wch: 50 }, // Additional Info
        { wch: 15 }, // Experience
        { wch: 25 }, // Website
        { wch: 40 }  // Social Media
      ];
      ws['!cols'] = colWidths;
      
      XLSX.writeFile(wb, `registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      // Update recent registrations for admin dashboard
      const recentRegistrations = existingRegistrations.slice(0, 5);
      localStorage.setItem('recentRegistrations', JSON.stringify(recentRegistrations));
      
      // Trigger real-time update for admin dashboard
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('adminDataUpdate', { 
          detail: { section: 'registrations', data: recentRegistrations } 
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Error saving registration:', error);
      throw new Error('Failed to save registration data');
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Save registration to Excel with comprehensive error handling
      await saveRegistrationToExcel(data);
      
      setIsSubmitted(true);
      toast.success('Registration successful! Welcome to Save Earth Ride community.');
      
      // Reset form for potential new registration
      reset({ type: registrationType });
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setRegistrationType(value as 'club' | 'individual');
    setValue('type', value as 'club' | 'individual');
    reset({ type: value as 'club' | 'individual' });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-12">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <Bike className="h-12 w-12 text-blue-500 animate-bounce" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Registration Successful!
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Welcome to the Save Earth Ride community! You're now part of a global movement of riders making a difference.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg mb-8">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">What's Next?</h3>
                  <ul className="text-green-700 dark:text-green-300 space-y-2 text-left">
                    <li>• Check your email for a welcome message with community guidelines</li>
                    <li>• Join our upcoming rides and tree planting events</li>
                    <li>• Connect with fellow riders in your area</li>
                    <li>• Start making a positive environmental impact</li>
                  </ul>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => window.location.href = '/'} size="lg">
                    <Bike className="h-5 w-5 mr-2" />
                    Explore Community
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/gallery'} size="lg">
                    View Gallery
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Bike className="h-10 w-10 text-primary animate-bounce" />
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Join Our Community
            </h1>
            <p className="text-xl text-muted-foreground">
              Register as an individual rider or motorcycle club to be part of our global environmental movement.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <span>Registration Form</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Registration Type */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Registration Type</Label>
                <RadioGroup
                  value={registrationType}
                  onValueChange={handleTypeChange}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual" className="flex items-center space-x-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Individual Rider</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="club" id="club" />
                    <Label htmlFor="club" className="flex items-center space-x-2 cursor-pointer">
                      <Users className="h-4 w-4" />
                      <span>Motorcycle Club</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Individual Form */}
                {registrationType === 'individual' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...register('firstName')}
                          placeholder="Enter your first name"
                          className="bg-background"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...register('lastName')}
                          placeholder="Enter your last name"
                          className="bg-background"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ridingExperience">Riding Experience *</Label>
                      <Select onValueChange={(value) => setValue('ridingExperience', value)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select your riding experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                          <SelectItem value="experienced">Experienced (6-10 years)</SelectItem>
                          <SelectItem value="expert">Expert (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.ridingExperience && (
                        <p className="text-sm text-red-500">{errors.ridingExperience.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Personal Bio *</Label>
                      <Textarea
                        id="bio"
                        {...register('bio')}
                        placeholder="Tell us about yourself, your passion for riding, and environmental interests..."
                        rows={4}
                        className="bg-background"
                      />
                      {errors.bio && (
                        <p className="text-sm text-red-500">{errors.bio.message}</p>
                      )}
                    </div>
                  </>
                )}

                {/* Club Form */}
                {registrationType === 'club' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="clubName">Club Name *</Label>
                      <Input
                        id="clubName"
                        {...register('clubName')}
                        placeholder="Enter your club name"
                        className="bg-background"
                      />
                      {errors.clubName && (
                        <p className="text-sm text-red-500">{errors.clubName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="adminName">Admin/Contact Person Name *</Label>
                      <Input
                        id="adminName"
                        {...register('adminName')}
                        placeholder="Enter admin name"
                        className="bg-background"
                      />
                      {errors.adminName && (
                        <p className="text-sm text-red-500">{errors.adminName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Club Description *</Label>
                      <Textarea
                        id="description"
                        {...register('description')}
                        placeholder="Describe your club, its mission, and environmental initiatives..."
                        rows={4}
                        className="bg-background"
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        {...register('website')}
                        placeholder="https://yourclub.com"
                        className="bg-background"
                      />
                    </div>
                  </>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="Enter your email"
                      className="bg-background"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="Enter your phone number"
                      className="bg-background"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select onValueChange={(value) => setValue('country', value)}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-sm text-red-500">{errors.country.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      {...register('city')}
                      placeholder="Enter your city"
                      className="bg-background"
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city.message}</p>
                    )}
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Social Media (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram" className="flex items-center space-x-2">
                        <Instagram className="h-4 w-4" />
                        <span>Instagram</span>
                      </Label>
                      <Input
                        id="instagram"
                        {...register('instagram')}
                        placeholder="@username"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook" className="flex items-center space-x-2">
                        <Facebook className="h-4 w-4" />
                        <span>Facebook</span>
                      </Label>
                      <Input
                        id="facebook"
                        {...register('facebook')}
                        placeholder="Facebook profile/page"
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="flex items-center space-x-2">
                        <Twitter className="h-4 w-4" />
                        <span>Twitter</span>
                      </Label>
                      <Input
                        id="twitter"
                        {...register('twitter')}
                        placeholder="@username"
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Bike className="h-5 w-5 mr-2" />
                      Complete Registration
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}