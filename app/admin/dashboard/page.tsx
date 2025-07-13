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
  CreditCard, UserPlus, Clock, Flag
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function AdminDashboardPage() {
  const [treeCount, setTreeCount] = useState(25847);
  const [newTreeCount, setNewTreeCount] = useState(25847);
  const [recentDonations, setRecentDonations] = useState([
    { id: 1, name: 'Anonymous', amount: 500, currency: 'USD', date: '2024-12-15' },
    { id: 2, name: 'John Doe', amount: 250, currency: 'USD', date: '2024-12-14' },
    { id: 3, name: 'Maria Garcia', amount: 100, currency: 'EUR', date: '2024-12-13' },
    { id: 4, name: 'Riders Club', amount: 1000, currency: 'USD', date: '2024-12-12' },
    { id: 5, name: 'Sarah Johnson', amount: 75, currency: 'GBP', date: '2024-12-11' }
  ]);
  const [recentRegistrations, setRecentRegistrations] = useState([
    { id: 1, name: 'Alex Thompson', type: 'Individual', location: 'California, USA', date: '2024-12-15' },
    { id: 2, name: 'Thunder Riders MC', type: 'Club', location: 'Texas, USA', date: '2024-12-14' },
    { id: 3, name: 'Emma Wilson', type: 'Individual', location: 'London, UK', date: '2024-12-13' },
    { id: 4, name: 'Green Wheels Club', type: 'Club', location: 'Berlin, Germany', date: '2024-12-12' },
    { id: 5, name: 'Carlos Rodriguez', type: 'Individual', location: 'Madrid, Spain', date: '2024-12-11' }
  ]);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadDataFromStorage();
    
    // Listen for real-time updates
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail.section === 'treeCount') {
        setTreeCount(event.detail.data);
        setNewTreeCount(event.detail.data);
      } else if (event.detail.section === 'registrations') {
        setRecentRegistrations(event.detail.data.slice(0, 5));
      }
    };

    window.addEventListener('adminDataUpdate', handleUpdate as EventListener);
    return () => window.removeEventListener('adminDataUpdate', handleUpdate as EventListener);
  }, []);

  // Load data from localStorage
  const loadDataFromStorage = () => {
    try {
      const savedTreeCount = localStorage.getItem('treeCount');
      if (savedTreeCount) {
        const count = parseInt(savedTreeCount);
        setTreeCount(count);
        setNewTreeCount(count);
      }
      
      const savedDonations = localStorage.getItem('recentDonations');
      if (savedDonations) {
        setRecentDonations(JSON.parse(savedDonations));
      }
      
      const savedRegistrations = localStorage.getItem('recentRegistrations');
      if (savedRegistrations) {
        setRecentRegistrations(JSON.parse(savedRegistrations).slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Save data to file and localStorage
  const saveDataToFile = (data: any, filename: string) => {
    try {
      // Save to localStorage for persistence
      localStorage.setItem(filename, typeof data === 'object' ? JSON.stringify(data) : data.toString());
      
      // Create downloadable file
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Data saved to file!');
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
    }
  };

  // Update tree count
  const updateTreeCount = () => {
    setTreeCount(newTreeCount);
    saveDataToFile(newTreeCount, 'treeCount');
    
    // Trigger real-time update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adminDataUpdate', { 
        detail: { section: 'treeCount', data: newTreeCount } 
      }));
    }
    
    toast.success('Tree count updated successfully!');
  };

  // const handleLogout = () => {
  //   // Redirect to admin login
  //   window.location.href = '/admin';
  //   toast.success('Logged out successfully');
  // };

  // Export all data to Excel
  const exportAllData = () => {
    try {
      const allData = {
        treeCount,
        recentDonations,
        recentRegistrations,
        exportDate: new Date().toISOString()
      };
      
      const wb = XLSX.utils.book_new();
      
      // Tree count sheet
      const treeWs = XLSX.utils.json_to_sheet([{ treeCount, lastUpdated: new Date().toISOString() }]);
      XLSX.utils.book_append_sheet(wb, treeWs, 'Tree Count');
      
      // Donations sheet
      const donationsWs = XLSX.utils.json_to_sheet(recentDonations);
      XLSX.utils.book_append_sheet(wb, donationsWs, 'Recent Donations');
      
      // Registrations sheet
      const registrationsWs = XLSX.utils.json_to_sheet(recentRegistrations);
      XLSX.utils.book_append_sheet(wb, registrationsWs, 'Recent Registrations');
      
      XLSX.writeFile(wb, `dashboard_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Dashboard data exported to Excel!');
    } catch (error) {
      console.error('Excel export failed:', error);
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            {/* <div className="flex items-center space-x-2">
              {/* <Bike className="h-8 w-8 text-primary" /> */}
              {/* <TreePine className="h-8 w-8 text-green-600" /> 
            </div> */}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">Manage Save Earth Ride Platform</p>
            </div>
          </div>
          {/* <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button> */}
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
                  <div className="text-2xl font-bold text-green-500 dark:text-blue-500">{treeCount.toLocaleString()}</div>
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
                  <div className="text-2xl font-bold text-green-500 dark:text-blue-500">52,340</div>
                  <div className="text-sm text-green-500 dark:text-blue-500">Global Riders</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500 dark:text-blue-500">
                    ${recentDonations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-500 dark:text-blue-500">Recent Donations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500 dark:text-blue-500">{recentRegistrations.length}</div>
                  <div className="text-sm text-green-500 dark:text-blue-500">New Registrations</div>
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
                />
              </div>
              <Button onClick={updateTreeCount} className="mt-6">
                <Save className="h-4 w-4 mr-2" />
                Update Count
              </Button>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{treeCount.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Trees planted globally</div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Donations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <span>Recent Donations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{donation.name}</div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{donation.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {donation.currency === 'USD' ? '$' : donation.currency === 'EUR' ? '€' : '£'}{donation.amount}
                      </div>
                      <div className="text-xs text-gray-500">{donation.currency}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                {recentRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{registration.name}</div>
                      <div className="text-sm text-gray-500">{registration.location}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={registration.type === 'Club' ? 'default' : 'outline'}>
                        {registration.type}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">{registration.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/admin/drives">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Flag className="h-6 w-6" />
                  <span>Drives Manager</span>
                </Button>
              </Link>
              <Link href="/admin/timeline">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Calendar className="h-6 w-6" />
                  <span>Timeline Manager</span>
                </Button>
              </Link>
              <Link href="/admin/gallery">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Users className="h-6 w-6" />
                  <span>Gallery Manager</span>
                </Button>
              </Link>
              <Link href="/admin/blog">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Blog Manager</span>
                </Button>
              </Link>
              <Link href="/admin/map">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <MapPin className="h-6 w-6" />
                  <span>Map Manager</span>
                </Button>
              </Link>
              <Link href="/admin/sponsors">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Handshake className="h-6 w-6" />
                  <span>Sponsors Manager</span>
                </Button>
              </Link>
              <Link href="/admin/admins">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Shield className="h-6 w-6" />
                  <span>Admin Manager</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-20 flex flex-col space-y-2"
                onClick={exportAllData}
              >
                <Upload className="h-6 w-6" />
                <span>Export Data</span>
              </Button>
              <Link href="/">
                <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                  <Eye className="h-6 w-6" />
                  <span>View Website</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}