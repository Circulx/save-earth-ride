'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Camera, Plus, Edit, Trash2, Save, X, MapPin, Calendar,
  ArrowLeft, Bike, Image as ImageIcon, Filter
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';

// Initial gallery data
const initialGalleryData = [
  {
    id: 1,
    image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=500',
    title: 'Himalayan Tree Drive',
    location: 'Nepal',
    city: 'Kathmandu',
    year: '2024',
    tags: ['Tree Planting', 'Mountain Ride'],
    description: 'Epic ride through the Himalayas with 200 trees planted',
  },
  {
    id: 2,
    image: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=500',
    title: 'Coastal Conservation Ride',
    location: 'Australia',
    city: 'Sydney',
    year: '2024',
    tags: ['Beach Cleanup', 'Conservation'],
    description: 'Coastal cleanup and tree planting along the Pacific Coast',
  },
  {
    id: 3,
    image: 'https://images.pexels.com/photos/1005648/pexels-photo-1005648.jpeg?auto=compress&cs=tinysrgb&w=500',
    title: 'Forest Restoration Project',
    location: 'Canada',
    city: 'Vancouver',
    year: '2023',
    tags: ['Reforestation', 'Group Ride'],
    description: 'Massive reforestation effort with local communities',
  },
  {
    id: 4,
    image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=500',
    title: 'Desert Oasis Initiative',
    location: 'UAE',
    city: 'Dubai',
    year: '2023',
    tags: ['Desert Ride', 'Oasis Creation'],
    description: 'Creating green oases in the desert landscape',
  },
  {
    id: 5,
    image: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=500',
    title: 'Amazon Conservation Ride',
    location: 'Brazil',
    city: 'Manaus',
    year: '2024',
    tags: ['Amazon', 'Conservation'],
    description: 'Protecting the lungs of the Earth through awareness rides',
  },
  {
    id: 6,
    image: 'https://images.pexels.com/photos/1005648/pexels-photo-1005648.jpeg?auto=compress&cs=tinysrgb&w=500',
    title: 'Urban Green Initiative',
    location: 'Japan',
    city: 'Tokyo',
    year: '2023',
    tags: ['Urban Planting', 'City Ride'],
    description: 'Bringing green spaces to urban environments',
  },
];

export default function AdminGalleryPage() {
  const [galleryData, setGalleryData] = useState(initialGalleryData);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterYear, setFilterYear] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    city: '',
    year: '',
    tags: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    loadDataFromStorage();
  }, []);

  const loadDataFromStorage = () => {
    try{
      const savedData = localStorage.getItem('galleryData');
      if (savedData){
        const parsedData = JSON.parse(savedData);
        const validData = parsedData.filter((item: any) =>
          item.id && item.title && item.location && item.city && item.year && item.image
        );
        setGalleryData(validData);
      }
    } catch (error) {
      console.error('Error loading Gallery Data from localStorage:', error);
      toast.error('Failed to load gallery data ');
    }
  };

  const saveDataToFile = (data: any[]) => {
    try{
      localStorage.setItem('galleryData', JSON.stringify(data));
      toast.success('Gallery data saved Successfully!'); 

      const excelData = data.map(item => ({
        ...item,
        tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags,
        image: item.image || 'No Image Provided',
        description: item.description || 'No Description Provided',
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Gallery');
      XLSX.writeFile(wb, `gallery_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Gallery data exported to Excel!');
    } catch (error) { 
      console.error('Error saving gallery data : ', error);
      toast.error('Failed to save gallery data');
    }
  }
  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(galleryData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Gallery');
    XLSX.writeFile(wb, `gallery_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Gallery data exported to Excel!');
  };

  // Real-time update function
  const updateGalleryData = (newData: any[]) => {
    setGalleryData(newData);
    saveDataToFile(newData);
    
    // // Save to localStorage for user-side access
    // localStorage.setItem('galleryData', JSON.stringify(newData));
    
    // Trigger real-time update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adminDataUpdate', { 
        detail: { section: 'gallery', data: newData } 
      }));
    }
  };

  // Add new gallery item
  const handleAdd = () => {
    if (!formData.title || !formData.location || !formData.city || !formData.year) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    const updatedData = [...galleryData, newItem];
    updateGalleryData(updatedData);
    
    resetForm();
    setIsAddingNew(false);
    toast.success('Gallery item added successfully!');
  };

  // Edit gallery item
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      location: item.location,
      city: item.city,
      year: item.year,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags,
      description: item.description,
      image: item.image
    });
  };

  // Update gallery item
  const handleUpdate = () => {
    if (!formData.title || !formData.location || !formData.city || !formData.year) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedData = galleryData.map(item => 
      item.id === editingItem.id 
        ? {
            ...item,
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          }
        : item
    );

    updateGalleryData(updatedData);
    setEditingItem(null);
    resetForm();
    toast.success('Gallery item updated successfully!');
  };

  // Delete gallery item
  const handleDelete = (id: number) => {
    if (!confirm('are you sure you want to delete this gallery item ?')) return;

    const updatedData = galleryData.filter(item => item.id !== id);
    updateGalleryData(updatedData);
    toast.success('Gallery item deleted successfully!');
  };

  const resetForm = () => {
    setFormData({
      title: '', location: '', city: '', year: '', tags: '', description: '', image: ''
    });
  }

  // Filter data
  const filteredData = galleryData.filter(item => {
    const yearMatch = filterYear === 'all' || item.year === filterYear;
    const countryMatch = filterCountry === 'all' || item.location === filterCountry;
    return yearMatch && countryMatch;
  });

  const years = [...new Set(galleryData.map(item => item.year))];
  const countries = [...new Set(galleryData.map(item => item.location))];

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
                <Camera className="h-8 w-8 text-primary" />
                <Bike className="h-6 w-6 text-blue-600" />
              </div> */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Gallery Management
                </h1>
                <p className="text-gray-600">Manage photo gallery and media</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => saveDataToFile(galleryData)} variant="outline">
              <ImageIcon className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Photo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{galleryData.length}</div>
                  <div className="text-sm text-blue-600">Total Photos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">{countries.length}</div>
                  <div className="text-sm text-green-600">Countries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">{years.length}</div>
                  <div className="text-sm text-purple-600">Active Years</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">{filteredData.length}</div>
                  <div className="text-sm text-orange-600">Filtered Results</div>
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
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Filters:</span>
              </div>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Countries</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterYear('all');
                  setFilterCountry('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {item.year}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2 flex space-x-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{item.city}, {item.location}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(item.tags) ? item.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    )) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">
              No photos found matching your filters.
            </p>
          </div>
        )}

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
                {editingItem ? 'Edit Gallery Photo' : 'Add New Gallery Photo'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Photo Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter photo title"
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="Enter year"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Country *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Enter country"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Image URL *</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="e.g. Tree Planting, Mountain Ride, Conservation"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter photo description"
                  rows={3}
                />
              </div>

              {formData.image && (
                <div>
                  <Label>Preview</Label>
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
              )}

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
                  {editingItem ? 'Update' : 'Add'} Photo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}