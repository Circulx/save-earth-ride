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
  MapPin, Plus, Edit, Trash2, Save, X, Calendar, Users, TreePine,
  ArrowLeft, Bike, Navigation, Globe, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface MapItem {
  id: number;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  date: string;
  type: string;
  participants: number;
  treesPlanted: number;
  description: string;
  image: string;
  organizer: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminMapPage() {
  const [mapData, setMapData] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MapItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    date: '',
    type: '',
    participants: '',
    treesPlanted: '',
    description: '',
    image: '',
    organizer: '',
    status: 'upcoming'
  });

  const eventTypes = [
    'Tree Planting',
    'Beach Cleanup',
    'Conservation',
    'Awareness',
    'Desert Greening',
    'Water Conservation',
    'Urban Planting',
    'Mountain Cleanup'
  ];

  const statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];

  // Load data from API on component mount
  useEffect(() => {
    loadMapData();
  }, []);

  // Load data from API
  const loadMapData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/map');
      const result = await response.json();
      
      if (result.success) {
        setMapData(result.data);
      } else {
        toast.error('Failed to load map data');
      }
    } catch (error) {
      console.error('Error loading map data:', error);
      toast.error('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  // Save data to Excel for backup
  const saveDataToExcel = (data: MapItem[]) => {
    try {
      const ws = XLSX.utils.json_to_sheet(data.map(item => ({
        ...item,
        coordinates: `${item.coordinates.lat}, ${item.coordinates.lng}`
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Map');
      XLSX.writeFile(wb, `map_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Map data exported to Excel!');
    } catch (error) {
      console.error('Error saving map data:', error);
      toast.error('Failed to export map data');
    }
  };

  // Add new map location
  const handleAdd = async () => {
    if (!formData.name || !formData.location || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newItem = {
        ...formData,
        coordinates: { 
          lat: parseFloat(formData.latitude), 
          lng: parseFloat(formData.longitude) 
        },
        participants: parseInt(formData.participants) || 0,
        treesPlanted: parseInt(formData.treesPlanted) || 0
      };

      const response = await fetch('/api/map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          data: newItem
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await loadMapData(); // Refresh data from server
        resetForm();
        setIsAddingNew(false);
        toast.success('Map location added successfully!');
      } else {
        toast.error('Failed to add map location');
      }
    } catch (error) {
      console.error('Error adding map location:', error);
      toast.error('Failed to add map location');
    }
  };

  // Edit map location
  const handleEdit = (item: MapItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      location: item.location,
      latitude: item.coordinates.lat.toString(),
      longitude: item.coordinates.lng.toString(),
      date: item.date,
      type: item.type,
      participants: item.participants.toString(),
      treesPlanted: item.treesPlanted.toString(),
      description: item.description,
      image: item.image,
      organizer: item.organizer,
      status: item.status
    });
  };

  // Update map location
  const handleUpdate = async () => {
    if (!formData.name || !formData.location || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedItem = {
        ...editingItem,
        ...formData,
        coordinates: { 
          lat: parseFloat(formData.latitude), 
          lng: parseFloat(formData.longitude) 
        },
        participants: parseInt(formData.participants) || 0,
        treesPlanted: parseInt(formData.treesPlanted) || 0
      };

      const response = await fetch('/api/map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          data: updatedItem
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await loadMapData(); // Refresh data from server
        setEditingItem(null);
        resetForm();
        toast.success('Map location updated successfully!');
      } else {
        toast.error('Failed to update map location');
      }
    } catch (error) {
      console.error('Error updating map location:', error);
      toast.error('Failed to update map location');
    }
  };

  // Delete map location
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this map location?')) {
      return;
    }

    try {
      const response = await fetch('/api/map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          data: { id }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await loadMapData(); // Refresh data from server
        toast.success('Map location deleted successfully!');
      } else {
        toast.error('Failed to delete map location');
      }
    } catch (error) {
      console.error('Error deleting map location:', error);
      toast.error('Failed to delete map location');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '', location: '', latitude: '', longitude: '', date: '', 
      type: '', participants: '', treesPlanted: '', description: '', 
      image: '', organizer: '', status: 'upcoming'
    });
  };

  // Filter data
  const filteredData = mapData.filter(item => {
    const typeMatch = filterType === 'all' || item.type === filterType;
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Tree Planting': return 'bg-green-100 text-green-800';
      case 'Beach Cleanup': return 'bg-blue-100 text-blue-800';
      case 'Conservation': return 'bg-amber-100 text-amber-800';
      case 'Awareness': return 'bg-purple-100 text-purple-800';
      case 'Desert Greening': return 'bg-orange-100 text-orange-800';
      case 'Water Conservation': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
                <MapPin className="h-8 w-8 text-primary" />
                <Bike className="h-6 w-6 text-blue-600" />
              </div> */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Map Management
                </h1>
                <p className="text-gray-600">Manage map locations and events</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => saveDataToExcel(mapData)} variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{mapData.length}</div>
                  <div className="text-sm text-blue-600">Total Locations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {mapData.reduce((sum, item) => sum + item.participants, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Total Participants</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <TreePine className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">
                    {mapData.reduce((sum, item) => sum + item.treesPlanted, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-600">Trees Planted</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Navigation className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">
                    {new Set(mapData.map(item => item.location.split(', ')[1])).size}
                  </div>
                  <div className="text-sm text-orange-600">Countries</div>
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
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Filters:</span>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterType('all');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map Locations List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle>Map Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredData.map((item) => (
                <Card key={item.id} className="border-2 border-gray-200 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {item.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{item.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(item.date).toLocaleDateString()}</span>
                              </div>
                              <Badge className={getTypeColor(item.type)}>
                                {item.type}
                              </Badge>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{item.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1 text-blue-600">
                                <Users className="h-4 w-4" />
                                <span>{item.participants} participants</span>
                              </div>
                              <div className="flex items-center space-x-1 text-green-600">
                                <TreePine className="h-4 w-4" />
                                <span>{item.treesPlanted} trees</span>
                              </div>
                              <div className="text-gray-500">
                                Coordinates: {item.coordinates.lat}, {item.coordinates.lng}
                              </div>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Map Location' : 'Add New Map Location'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter event name"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    placeholder="e.g., 27.7172"
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    placeholder="e.g., 85.3240"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Event Type</Label>
                  <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="participants">Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    value={formData.participants}
                    onChange={(e) => setFormData({...formData, participants: e.target.value})}
                    placeholder="Number of participants"
                  />
                </div>
                <div>
                  <Label htmlFor="treesPlanted">Trees Planted</Label>
                  <Input
                    id="treesPlanted"
                    type="number"
                    value={formData.treesPlanted}
                    onChange={(e) => setFormData({...formData, treesPlanted: e.target.value})}
                    placeholder="Number of trees"
                  />
                </div>
                <div>
                  <Label htmlFor="organizer">Organizer</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                    placeholder="Event organizer"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter event description"
                  rows={3}
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
                  {editingItem ? 'Update' : 'Add'} Location
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}