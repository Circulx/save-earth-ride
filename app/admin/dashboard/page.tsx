'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  TreePine, Users, Calendar, BookOpen, MapPin, Heart, Settings, 
  LogOut, Plus, Edit, Trash2, Upload, Save, Eye, Handshake,
  BarChart3, TrendingUp, Globe, Bike, ExternalLink, Shield,
  CreditCard, UserPlus, Clock, Flag, RefreshCw, Loader2, User
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface Registration {
  id: string;
  type: 'individual' | 'club';
  firstName?: string;
  lastName?: string;
  clubName?: string;
  adminName?: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  licenceNumber: string;
  bio?: string;
  description?: string;
  ridingExperience?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  acceptTerms: boolean;
  registrationDate: string;
}

interface DashboardData {
  treeCount: {
    count: number;
    lastUpdated: string;
  };
  recentDonations: Array<{
    id: string;
    name: string;
    amount: number;
    currency: string;
    date: string;
    email?: string;
    message?: string;
  }>;
  recentRegistrations: Registration[];
  totalRiders: number;
}

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newTreeCount, setNewTreeCount] = useState(0);

  // Fetch registrations from your registration API
  const fetchRegistrations = async (): Promise<Registration[]> => {
    try {
      const response = await fetch('/api/register?action=list');
      const result = await response.json();
      
      if (result.success) {
        return result.data || [];
      } else {
        console.error('Failed to fetch registrations:', result.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      return [];
    }
  };

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch registrations from your registration API
      const registrations = await fetchRegistrations();
      
      // Sort by registration date (most recent first) and take only the last 10
      const recentRegistrations = registrations
        .sort((a, b) => new Date(b.registrationDate || '').getTime() - new Date(a.registrationDate || '').getTime())
        .slice(0, 10);

      // Try to fetch other dashboard data (tree count, donations)
      let treeCount = { count: 15234, lastUpdated: new Date().toISOString() };
      let recentDonations: any[] = [];
      
      try {
        const dashboardResponse = await fetch('/api/dashboard');
        const dashboardResult = await dashboardResponse.json();
        
        if (dashboardResult.success) {
          treeCount = dashboardResult.data.treeCount || treeCount;
          recentDonations = dashboardResult.data.recentDonations || [];
        }
      } catch (error) {
        console.log('Dashboard API not available, using mock data');
        // Mock donations data
        recentDonations = [
          {
            id: '1',
            name: 'John Doe',
            amount: 50,
            currency: 'USD',
            date: new Date().toISOString(),
            email: 'john@example.com'
          },
          {
            id: '2',
            name: 'Jane Smith',
            amount: 100,
            currency: 'USD',
            date: new Date(Date.now() - 86400000).toISOString(),
            email: 'jane@example.com'
          }
        ];
      }

      const dashboardData: DashboardData = {
        treeCount,
        recentDonations,
        recentRegistrations,
        totalRiders: registrations.length
      };

      setDashboardData(dashboardData);
      setNewTreeCount(dashboardData.treeCount.count);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update tree count
  const updateTreeCount = async () => {
    if (!dashboardData) return;
    
    try {
      setUpdating(true);
      const response = await fetch('/api/dashboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateTreeCount',
          data: { count: newTreeCount }
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(prev => prev ? {
          ...prev,
          treeCount: result.data.treeCount
        } : null);
        toast.success('Tree count updated successfully!');
      } else {
        toast.error('Failed to update tree count');
        console.error('Tree count update error:', result.error);
      }
    } catch (error) {
      console.error('Error updating tree count:', error);
      toast.error('Failed to update tree count');
    } finally {
      setUpdating(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    fetchDashboardData();
    toast.success('Data refreshed!');
  };

  // Export all data to Excel
  const exportAllData = () => {
    if (!dashboardData) return;
    
    try {
      const wb = XLSX.utils.book_new();
      
      // Tree count sheet
      const treeWs = XLSX.utils.json_to_sheet([{
        treeCount: dashboardData.treeCount.count,
        lastUpdated: dashboardData.treeCount.lastUpdated
      }]);
      XLSX.utils.book_append_sheet(wb, treeWs, 'Tree Count');
      
      // Donations sheet
      const donationsWs = XLSX.utils.json_to_sheet(dashboardData.recentDonations);
      XLSX.utils.book_append_sheet(wb, donationsWs, 'Recent Donations');
      
      // Registrations sheet - format the data properly
      const formattedRegistrations = dashboardData.recentRegistrations.map(reg => ({
        ID: reg.id,
        Type: reg.type,
        Name: reg.type === 'individual' ? `${reg.firstName} ${reg.lastName}` : reg.clubName,
        AdminName: reg.type === 'club' ? reg.adminName : '',
        Email: reg.email,
        Phone: reg.phone,
        Country: reg.country,
        City: reg.city,
        LicenceNumber: reg.licenceNumber,
        RidingExperience: reg.ridingExperience || '',
        Bio: reg.bio || '',
        Description: reg.description || '',
        Website: reg.website || '',
        Instagram: reg.instagram || '',
        Facebook: reg.facebook || '',
        Twitter: reg.twitter || '',
        RegistrationDate: reg.registrationDate
      }));
      
      const registrationsWs = XLSX.utils.json_to_sheet(formattedRegistrations);
      XLSX.utils.book_append_sheet(wb, registrationsWs, 'Registrations');
      
      // Summary sheet
      const summaryWs = XLSX.utils.json_to_sheet([{
        totalTrees: dashboardData.treeCount.count,
        totalRiders: dashboardData.totalRiders,
        totalDonationAmount: dashboardData.recentDonations.reduce((sum, d) => sum + d.amount, 0),
        totalRegistrations: dashboardData.recentRegistrations.length,
        individualRiders: dashboardData.recentRegistrations.filter(r => r.type === 'individual').length,
        clubs: dashboardData.recentRegistrations.filter(r => r.type === 'club').length,
        exportDate: new Date().toISOString()
      }]);
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
      
      XLSX.writeFile(wb, `dashboard_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Dashboard data exported to Excel!');
    } catch (error) {
      console.error('Excel export failed:', error);
      toast.error('Failed to export data');
    }
  };

  // Helper function to format registration display name
  const getRegistrationDisplayName = (registration: Registration): string => {
    if (registration.type === 'individual') {
      return `${registration.firstName || ''} ${registration.lastName || ''}`.trim();
    } else {
      return registration.clubName || 'Unknown Club';
    }
  };

  // Helper function to format location
  const getLocationString = (registration: Registration): string => {
    return `${registration.city}, ${registration.country}`;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="text-xl text-gray-600">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  // Show error state if no data
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Failed to load dashboard data</h2>
          <Button onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  } 
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage Save Earth Ride Platform</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportAllData} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <TreePine className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500 dark:text-blue-500">
                    {dashboardData.treeCount.count.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-500 dark:text-blue-500">Trees Planted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500 dark:text-blue-500">
                    {dashboardData.totalRiders.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-500 dark:text-blue-500">Total Registered</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500 dark:text-blue-500">
                    ${dashboardData.recentDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-500 dark:text-blue-500">Recent Donations</div>
                </div>
              </div>
            </CardContent>
          </Card> */}

          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500 dark:text-blue-500">
                    {dashboardData.recentRegistrations.length}
                  </div>
                  <div className="text-sm text-green-500 dark:text-blue-500">Recent Registrations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tree Counter Management */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TreePine className="h-5 w-5 text-green-600" />
              <span>Tree Counter Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="treeCount">Current Tree Count</Label>
                <Input
                  id="treeCount"
                  type="number"
                  value={newTreeCount}
                  onChange={(e) => setNewTreeCount(parseInt(e.target.value) || 0)}
                  className="text-2xl font-bold text-green-600"
                  disabled={updating}
                />
              </div>
              <Button onClick={updateTreeCount} disabled={updating} className="mt-6">
                {updating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Update Count
              </Button>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {dashboardData.treeCount.count.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Trees planted globally</div>
              <div className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(dashboardData.treeCount.lastUpdated).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Donations */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <span>Recent Donations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentDonations.length > 0 ? (
                  dashboardData.recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{donation.name}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(donation.date).toLocaleDateString()}</span>
                        </div>
                        {donation.email && (
                          <div className="text-xs text-gray-400">{donation.email}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {donation.currency === 'USD' ? '$' : donation.currency === 'EUR' ? '€' : '£'}
                          {donation.amount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{donation.currency}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent donations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card> */}

          {/* Recent Registrations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <span>Recent Registrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData.recentRegistrations.length > 0 ? (
                  dashboardData.recentRegistrations.map((registration) => (
                    <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{getRegistrationDisplayName(registration)}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(registration.registrationDate || '').toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{getLocationString(registration)}</span>
                          </div>
                          {registration.ridingExperience && (
                            <div className="flex items-center space-x-1">
                              <Bike className="h-3 w-3" />
                              <span>{registration.ridingExperience}</span>
                            </div>
                          )}
                        </div>
                        {registration.email && (
                          <div className="text-xs text-gray-400 mt-1">{registration.email}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={registration.type === 'club' ? 'default' : 'secondary'}
                          className="text-xs mb-1"
                        >
                          {registration.type === 'club' ? 'Club' : 'Individual'}
                        </Badge>
                        <div className="text-xs text-gray-400">
                          {registration.phone}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent registrations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registration Statistics */}
        {/* <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Registration Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {dashboardData.recentRegistrations.filter(r => r.type === 'individual').length}
                </div>
                <div className="text-sm text-gray-600">Individual Riders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {dashboardData.recentRegistrations.filter(r => r.type === 'club').length}
                </div>
                <div className="text-sm text-gray-600">Motorcycle Clubs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {new Set(dashboardData.recentRegistrations.map(r => r.country)).size}
                </div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
            </div>
          </CardContent>
        </Card> */}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TreePine className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Tree Management</div>
                  <div className="text-xs text-gray-500">Update tree counts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">User Management</div>
                  <div className="text-xs text-gray-500">Manage riders</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Donations</div>
                  <div className="text-xs text-gray-500">View all donations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">Analytics</div>
                  <div className="text-xs text-gray-500">View reports</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span>System Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Registration API</div>
                  <div className="text-sm text-gray-500">Connected</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Database</div>
                  <div className="text-sm text-gray-500">Connected</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-medium">Google Sheets</div>
                  <div className="text-sm text-gray-500">Synced</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        {/* <div className="text-center text-sm text-gray-500 mt-8">
          <p>Save Earth Ride Admin Dashboard • Last updated: {new Date().toLocaleString()}</p>
          <div className="flex justify-center items-center space-x-4 mt-2">
            <Link href="/" className="hover:text-green-600 transition-colors">
              <Globe className="h-4 w-4 inline mr-1" />
              View Public Site
            </Link>
            <span>•</span>
            <Link href="/register" className="hover:text-green-600 transition-colors">
              <UserPlus className="h-4 w-4 inline mr-1" />
              Registration Form
            </Link>
          </div>
        </div> */}
      </div>
    </div>
  );
}