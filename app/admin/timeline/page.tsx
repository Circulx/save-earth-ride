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
  Calendar, Plus, Edit, Trash2, Save, X, MapPin, Users, TreePine,
  ArrowLeft, Bike, Clock, Loader2, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface TimelineItem {
  id: number;
  date: string;
  title: string;
  location: string;
  type: string;
  participants: number;
  treesPlanted: number;
  description: string;
  image: string;
  side: 'left' | 'right';
  contactEmail?: string;
}

/**
 * Form Validation Schema
 * 
 * Defines validation rules for drive form data to ensure data integrity.
 * This prevents invalid data from being saved and provides user feedback.
 */
const validateTimelineData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.title?.trim()) errors.push('Drive title is required');
  if (!data.location?.trim()) errors.push('Location is required');
  if (!data.date) errors.push('Date is required');
  if (!data.type?.trim()) errors.push('Type is required');
  if (!data.contactEmail?.trim()) errors.push('Contact email is required');
  if (data.contactEmail && !/\S+@\S+\.\S+/.test(data.contactEmail)) {
    errors.push('Valid email address is required');
  }
  if (data.participants && isNaN(Number(data.participants))) {
    errors.push('Participants must be a valid number');
  }
  if (data.treesPlanted && isNaN(Number(data.treesPlanted))) {
    errors.push('Trees planted must be a valid number');
  }
  if (data.image && !/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/.test(data.image)){
    errors.push('Image URL must be a valid image link (jpg, jpeg, png, gif)');
  }
  if(data.description){
    if (data.description.length < 10){
      errors.push('Description must be at least 10 characters long');
    }
  }
  if(data.side && !['left', 'right'].includes(data.side)){
    errors.push('Side must be either "left" or "right"');
  }
  
  return errors;
};

export default function AdminTimelinePage() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    type: '',
    participants: '',
    treesPlanted: '',
    description: '',
    image: '',
    side: 'left' as 'left' | 'right',
    contactEmail: ''
  });

  const eventTypes = ['Tree Planting', 'Conservation', 'Beach Cleanup', 'Awareness', 'Desert Greening', 'Global Event', 'Water Conservation', 'Urban Planting'];

  useEffect(() => {
    loadTimelineData();
  }, []);

  // Load timeline data from Google Sheets via API
  const loadTimelineData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/timeline');
      const result = await response.json();
      
      if (result.success) {
        setTimelineData(result.data);
      } else {
        toast.error('Failed to load timeline data');
        console.error('Error loading timeline data:', result.error);
      }
    } catch (error) {
      console.error('Error loading timeline data:', error);
      toast.error('Failed to load timeline data');
    } finally {
      setIsLoading(false);
    }
  };

  // Save timeline data to Google Sheets via API
  const saveTimelineData = async (data: TimelineItem[]) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/timeline', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Timeline data saved successfully!');
        
        // Export to Excel
        const excelData = data.map(item => ({
          ...item,
          participants: Number(item.participants) || 0,
          treesPlanted: Number(item.treesPlanted) || 0,
        }));
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Timeline');
        XLSX.writeFile(wb, `timeline_${new Date().toISOString().split('T')[0]}.xlsx`);
        
        // Trigger real-time update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('adminDataUpdate', { 
            detail: { section: 'timeline', data } 
          }));
        }
      } else {
        toast.error('Failed to save timeline data');
        console.error('Error saving timeline data:', result.error);
      }
    } catch (error) {
      console.error('Error saving timeline data:', error);
      toast.error('Failed to save timeline data');
    } finally {
      setIsSaving(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(timelineData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Timeline');
    XLSX.writeFile(wb, `timeline_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Timeline data exported to Excel!');
  };

  // Add new timeline item
  const handleAdd = async () => {
    const errors = validateTimelineData(formData);
    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/timeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setTimelineData([...timelineData, result.data]);
        resetForm();
        setIsAddingNew(false);
        toast.success('Timeline item added successfully!');
      } else {
        toast.error('Failed to add timeline item');
        console.error('Error adding timeline item:', result.error);
      }
    } catch (error) {
      console.error('Error adding timeline item:', error);
      toast.error('Failed to add timeline item');
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', location: '', date: '', type: '', participants: '', 
      treesPlanted: '', description: '', image: '', side: 'left', contactEmail: ''
    });
  };

  // Edit timeline item
  const handleEdit = (item: TimelineItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      location: item.location || '',
      date: item.date || '',
      type: item.type || 'Tree Planting',
      participants: item.participants.toString() || '',
      treesPlanted: item.treesPlanted.toString() || '',
      description: item.description || '',
      image: item.image || '',
      side: item.side || 'left',
      contactEmail: item.contactEmail || ''
    });
  };

  // Update timeline item
  const handleUpdate = async () => {
    const errors = validateTimelineData(formData);
    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }

    if (!editingItem) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/timeline', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, id: editingItem.id }),
      });

      const result = await response.json();
      
      if (result.success) {
        const updatedData = timelineData.map(item => 
          item.id === editingItem.id ? result.data : item
        );
        setTimelineData(updatedData);
        setEditingItem(null);
        resetForm();
        toast.success('Timeline item updated successfully!');
      } else {
        toast.error('Failed to update timeline item');
        console.error('Error updating timeline item:', result.error);
      }
    } catch (error) {
      console.error('Error updating timeline item:', error);
      toast.error('Failed to update timeline item');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete timeline item
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this timeline item?')) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/timeline?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        const updatedData = timelineData.filter(item => item.id !== id);
        setTimelineData(updatedData);
        toast.success('Timeline item deleted successfully!');
      } else {
        toast.error('Failed to delete timeline item');
        console.error('Error deleting timeline item:', result.error);
      }
    } catch (error) {
      console.error('Error deleting timeline item:', error);
      toast.error('Failed to delete timeline item');
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Tree Planting': return 'bg-green-100 text-green-800';
      case 'Conservation': return 'bg-amber-100 text-amber-800';
      case 'Beach Cleanup': return 'bg-blue-100 text-blue-800';
      case 'Awareness': return 'bg-purple-100 text-purple-800';
      case 'Desert Greening': return 'bg-orange-100 text-orange-800';
      case 'Global Event': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading timeline data...</p>
        </div>
      </div>
    );
  }

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
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Timeline Management
              </h1>
              <p className="text-gray-600">Manage timeline events and rides (Google Sheets)</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={loadTimelineData} 
              variant="outline" 
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportToExcel} variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => setIsAddingNew(true)} disabled={isSaving}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">{timelineData.length}</div>
                  <div className="text-sm text-green-600">Total Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {timelineData.reduce((sum, item) => sum + item.participants, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Total Participants</div>
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
                    {timelineData.reduce((sum, item) => sum + item.treesPlanted, 0).toLocaleString()}
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
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">
                    {new Set(timelineData.map(item => item.date.split('-')[0])).size}
                  </div>
                  <div className="text-sm text-orange-600">Active Years</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Items List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle>Timeline Events</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {timelineData.map((item) => (
                <Card key={item.id} className="border-2 border-gray-200 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {item.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(item.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{item.location}</span>
                              </div>
                              <Badge className={getTypeColor(item.type)}>
                                {item.type}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">{item.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1 text-blue-600">
                                <Users className="h-4 w-4" />
                                <span>{item.participants} riders</span>
                              </div>
                              <div className="flex items-center space-x-1 text-green-600">
                                <TreePine className="h-4 w-4" />
                                <span>{item.treesPlanted} trees</span>
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
                {editingItem ? 'Edit Timeline Event' : 'Add New Timeline Event'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
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
                  <Label htmlFor="side">Timeline Side</Label>
                  <Select onValueChange={(value) => setFormData({...formData, side: value as 'left' | 'right'})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select side" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                    placeholder="Number of trees planted"
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
                  rows={4}
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
                  {editingItem ? 'Update' : 'Add'} Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}