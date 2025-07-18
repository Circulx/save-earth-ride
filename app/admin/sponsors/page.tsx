'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Handshake, Plus, Edit, Trash2, Save, X, Star, Award,
  ArrowLeft, Bike, ExternalLink, Building
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';

// Initial sponsors data
const initialSponsorsData = [
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
    contactEmail: 'partnership@ecoride.com',
    contactPerson: 'John Smith',
    amount: 50000,
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
    contactEmail: 'partners@greentech.com',
    contactPerson: 'Sarah Johnson',
    amount: 25000,
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
    contactEmail: 'info@globalriders.org',
    contactPerson: 'Mike Rodriguez',
    amount: 0,
    type: 'partner'
  }
];

export default function AdminSponsorsPage() {
  const [sponsorsData, setSponsorsData] = useState(initialSponsorsData);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterTier, setFilterTier] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    tier: '',
    website: '',
    description: '',
    contribution: '',
    since: '',
    category: '',
    contactEmail: '',
    contactPerson: '',
    amount: '',
    type: 'sponsor'
  });

  const tiers = ['Platinum', 'Gold', 'Silver', 'Bronze'];
  const categories = ['Automotive', 'Technology', 'Food & Beverage', 'Accessories', 'Non-Profit', 'Energy', 'Finance', 'Healthcare'];
  const types = ['sponsor', 'partner'];

  // Load data from Excel on component mount
  useEffect(() => {
    loadDataFromGoogleSheets();
  }, []);

  // Load data from Google Sheets
  const loadDataFromGoogleSheets = async () => {
    try {
      const response = await fetch('/api/sponsors');
      const result = await response.json();
      
      if (result.success) {
        setSponsorsData(result.data);
      } else {
        console.error('Error loading sponsors data:', result.error);
        toast.error('Failed to load sponsors data');
      }
    } catch (error) {
      console.error('Error loading sponsors data:', error);
      toast.error('Failed to load sponsors data');
    }
  };

  // Save data to Google Sheets
  const saveDataToGoogleSheets = async (data: any[]) => {
    try {
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk_save',
          data: data
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Sponsors data saved to Google Sheets!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving sponsors data:', error);
      toast.error('Failed to save sponsors data');
    }
  };

  // Export to Excel (now gets data from Google Sheets)
  const exportToExcel = async () => {
    try {
      const response = await fetch('/api/sponsors');
      const result = await response.json();
      
      if (result.success) {
        const ws = XLSX.utils.json_to_sheet(result.data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sponsors');
        XLSX.writeFile(wb, `sponsors_data_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success('Sponsors data exported to Excel!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error exporting sponsors data:', error);
      toast.error('Failed to export sponsors data');
    }
  };

  // Real-time update function (now uses Google Sheets)
  const updateSponsorsData = async (newData: any[]) => {
    setSponsorsData(newData);
    await saveDataToGoogleSheets(newData);
    
    // Trigger real-time update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adminDataUpdate', { 
        detail: { section: 'sponsors', data: newData } 
      }));
    }
  };

  // Add new sponsor/partner (now uses API)
  const handleAdd = async () => {
    if (!formData.name || !formData.description || !formData.contribution) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          data: {
            ...formData,
            amount: parseFloat(formData.amount) || 0
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const updatedData = [...sponsorsData, result.data];
        setSponsorsData(updatedData);
        
        resetForm();
        setIsAddingNew(false);
        toast.success(`${formData.type === 'sponsor' ? 'Sponsor' : 'Partner'} added successfully!`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error adding sponsor:', error);
      toast.error('Failed to add sponsor');
    }
  };

  // Update sponsor/partner (now uses API)
  const handleUpdate = async () => {
    if (!formData.name || !formData.description || !formData.contribution) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          data: {
            id: editingItem.id,
            ...formData,
            amount: parseFloat(formData.amount) || 0
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const updatedData = sponsorsData.map(item => 
          item.id === editingItem.id ? result.data : item
        );
        setSponsorsData(updatedData);
        
        setEditingItem(null);
        resetForm();
        toast.success(`${formData.type === 'sponsor' ? 'Sponsor' : 'Partner'} updated successfully!`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating sponsor:', error);
      toast.error('Failed to update sponsor');
    }
  };

  // Delete sponsor/partner (now uses API)
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch('/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          data: { id }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const updatedData = sponsorsData.filter(item => item.id !== id);
        setSponsorsData(updatedData);
        toast.success('Item deleted successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast.error('Failed to delete sponsor');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      logo: item.logo,
      tier: item.tier,
      website: item.website,
      description: item.description,
      contribution: item.contribution,
      since: item.since,
      category: item.category,
      contactEmail: item.contactEmail,
      contactPerson: item.contactPerson,
      amount: item.amount.toString(),
      type: item.type
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '', logo: '', tier: '', website: '', description: '', 
      contribution: '', since: '', category: '', contactEmail: '', 
      contactPerson: '', amount: '', type: 'sponsor'
    });
  };

  // Filter data
  const filteredData = sponsorsData.filter(item => {
    const tierMatch = filterTier === 'all' || item.tier === filterTier;
    const typeMatch = filterType === 'all' || item.type === filterType;
    return tierMatch && typeMatch;
  });

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
      case 'Bronze': return <Handshake className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              {/* <div className="flex items-center space-x-2">
                <Handshake className="h-8 w-8 text-primary" />
                <Bike className="h-6 w-6 text-orange-600" />
              </div> */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-orange-600 bg-clip-text text-transparent">
                  Sponsors & Partners Management
                </h1>
                <p className="text-gray-600">Manage sponsors and strategic partners</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => exportToExcel} variant="outline">
              <Building className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sponsor/Partner
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Handshake className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">{sponsorsData.length}</div>
                  <div className="text-sm text-orange-600">Total Partners</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500 rounded-full">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {sponsorsData.filter(item => item.type === 'sponsor').length}
                  </div>
                  <div className="text-sm text-yellow-600">Sponsors</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {sponsorsData.filter(item => item.type === 'partner').length}
                  </div>
                  <div className="text-sm text-blue-600">Partners</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    ${sponsorsData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Total Funding</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Handshake className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Filters:</span>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Tiers</option>
                {tiers.map(tier => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterType('all');
                  setFilterTier('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sponsors/Partners List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
            <CardTitle>Sponsors & Partners</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredData.map((item) => (
                <Card key={item.id} className="border-2 border-gray-200 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.logo}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {item.name}
                              </h3>
                              {item.tier && (
                                <Badge className={`${getTierColor(item.tier)} text-xs px-2 py-1`}>
                                  {getTierIcon(item.tier)}
                                  <span className="ml-1">{item.tier}</span>
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span>{item.category}</span>
                              <span>•</span>
                              <span>Since {item.since}</span>
                              {item.amount > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600 font-medium">${item.amount.toLocaleString()}</span>
                                </>
                              )}
                            </div>
                            <p className="text-gray-600 mb-2">{item.description}</p>
                            <p className="text-sm text-gray-500 mb-3">
                              <strong>Contribution:</strong> {item.contribution}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Contact: {item.contactPerson}</span>
                              <span>•</span>
                              <span>{item.contactEmail}</span>
                              {item.website && (
                                <>
                                  <span>•</span>
                                  <a 
                                    href={item.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    <span>Website</span>
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isAddingNew || editingItem !== null} onOpenChange={(open) => {
          if (!open) {
            setIsAddingNew(false);
            setEditingItem(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Sponsor/Partner' : 'Add New Sponsor/Partner'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Company/Organization name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tier">Tier (for sponsors)</Label>
                  <Select onValueChange={(value) => setFormData({...formData, tier: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiers.map(tier => (
                        <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({...formData, logo: e.target.value})}
                    placeholder="Enter logo URL"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Company/Organization description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contribution">Contribution *</Label>
                <Textarea
                  id="contribution"
                  value={formData.contribution}
                  onChange={(e) => setFormData({...formData, contribution: e.target.value})}
                  placeholder="What they contribute to the cause"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="since">Partner Since</Label>
                  <Input
                    id="since"
                    value={formData.since}
                    onChange={(e) => setFormData({...formData, since: e.target.value})}
                    placeholder="e.g., 2022"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="Sponsorship amount"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                  placeholder="contact@example.com"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={editingItem ? handleUpdate : handleAdd}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingItem ? 'Update' : 'Add'} {formData.type === 'sponsor' ? 'Sponsor' : 'Partner'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}