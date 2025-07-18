
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bike, Plus, Edit, Trash2, Save, X, Calendar, MapPin, Users, TreePine,
  ArrowLeft, Clock, Target, Flag, Upload, AlertCircle, RefreshCw, Database
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import Image from 'next/image';

/**
 * Form Validation Schema
 * 
 * Defines validation rules for drive form data to ensure data integrity.
 * This prevents invalid data from being saved and provides user feedback.
 */
const validateDriveData = (data: any) => {
  const errors: string[] = [];
  
  if (!data.title?.trim()) errors.push('Drive title is required');
  if (!data.location?.trim()) errors.push('Location is required');
  if (!data.date) errors.push('Date is required');
  if (!data.organizer?.trim()) errors.push('Organizer is required');
  if (!data.contactEmail?.trim()) errors.push('Contact email is required');
  if (data.contactEmail && !/\S+@\S+\.\S+/.test(data.contactEmail)) {
    errors.push('Valid email address is required');
  }
  if (data.participants && isNaN(Number(data.participants))) {
    errors.push('Participants must be a valid number');
  }
  if (data.treesTarget && isNaN(Number(data.treesTarget))) {
    errors.push('Trees target must be a valid number');
  }
  
  return errors;
};

export default function AdminDrivesPage() {
  const [drivesData, setDrivesData] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    participants: '',
    treesTarget: '',
    status: 'upcoming',
    registrationOpen: true,
    description: '',
    organizer: '',
    contactEmail: '',
    registrationDeadline: '',
    meetingPoint: '',
    duration: '',
    difficulty: 'Easy',
    logo: ''
  });

  const statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
  const difficulties = ['Easy', 'Moderate', 'Challenging', 'Expert'];

  /**
   * API Functions
   */
  const fetchDrives = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/drives');
      if (!response.ok) throw new Error('Failed to fetch drives');
      const data = await response.json();
      setDrivesData(data);
    } catch (error) {
      console.error('Error fetching drives:', error);
      toast.error('Failed to load drives');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeSheet = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch('/api/drives', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'initialize_sheet' })
      });
      
      if (!response.ok) throw new Error('Failed to initialize sheet');
      
      toast.success('Google Sheet initialized successfully!');
      await fetchDrives();
    } catch (error) {
      console.error('Error initializing sheet:', error);
      toast.error('Failed to initialize Google Sheet');
    } finally {
      setIsInitializing(false);
    }
  };

  const saveDrive = async (driveData: any) => {
    try {
      const response = await fetch('/api/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driveData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save drive');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving drive:', error);
      throw error;
    }
  };

  const updateDrive = async (id: string, driveData: any) => {
    try {
      const response = await fetch('/api/drives', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...driveData })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update drive');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating drive:', error);
      throw error;
    }
  };

  const deleteDrive = async (id: string) => {
    try {
      const response = await fetch(`/api/drives?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete drive');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting drive:', error);
      throw error;
    }
  };

  /**
   * Component Lifecycle
   */
  useEffect(() => {
    fetchDrives();
  }, []);

  /**
   * Data Export Functions
   */
  const exportToExcel = () => {
    try {
      const excelData = drivesData.map(item => ({
        ...item,
        registrationOpen: item.registrationOpen ? 'Yes' : 'No',
        participants: Number(item.participants) || 0,
        treesTarget: Number(item.treesTarget) || 0
      }));
      
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Current Drives');
      XLSX.writeFile(wb, `current_drives_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Excel file exported successfully!');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export Excel file');
    }
  };

  /**
   * Logo Upload Handler
   */
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      setFormData(prev => ({ ...prev, logo: result }));
    };
    reader.readAsDataURL(file);
  };

  /**
   * Form Handlers
   */
  const handleAdd = async () => {
    const errors = validateDriveData(formData);
    if (errors.length > 0) {
      toast.error(`Validation errors: ${errors.join(', ')}`);
      return;
    }

    setIsLoading(true);
    try {
      const driveData = {
        ...formData,
        participants: parseInt(formData.participants) || 0,
        treesTarget: parseInt(formData.treesTarget) || 0
      };

      await saveDrive(driveData);
      await fetchDrives();
      
      resetForm();
      setIsAddingNew(false);
      toast.success('Drive added successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      location: item.location || '',
      date: item.date || '',
      participants: item.participants?.toString() || '',
      treesTarget: item.treesTarget?.toString() || '',
      status: item.status || 'upcoming',
      registrationOpen: item.registrationOpen ?? true,
      description: item.description || '',
      organizer: item.organizer || '',
      contactEmail: item.contactEmail || '',
      registrationDeadline: item.registrationDeadline || '',
      meetingPoint: item.meetingPoint || '',
      duration: item.duration || '',
      difficulty: item.difficulty || 'Easy',
      logo: item.logo || ''
    });
    setLogoPreview(item.logo || '');
  };

  const handleUpdate = async () => {
    const errors = validateDriveData(formData);
    if (errors.length > 0) {
      toast.error(`Validation errors: ${errors.join(', ')}`);
      return;
    }

    setIsLoading(true);
    try {
      const driveData = {
        ...formData,
        participants: parseInt(formData.participants) || 0,
        treesTarget: parseInt(formData.treesTarget) || 0
      };

      await updateDrive(editingItem.id, driveData);
      await fetchDrives();
      
      setEditingItem(null);
      resetForm();
      toast.success('Drive updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update drive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this drive?')) return;
    
    setIsLoading(true);
    try {
      await deleteDrive(id);
      await fetchDrives();
      toast.success('Drive deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete drive');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', location: '', date: '', participants: '', treesTarget: '', 
      status: 'upcoming', registrationOpen: true, description: '', organizer: '', 
      contactEmail: '', registrationDeadline: '', meetingPoint: '', duration: '', 
      difficulty: 'Easy', logo: ''
    });
    setLogoPreview('');
  };

  // Filter data based on status
  const filteredData = drivesData.filter(item => {
    return filterStatus === 'all' || item.status === filterStatus;
  });

  /**
   * Status Color Helper
   * 
   * Returns appropriate color classes for different drive statuses.
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Challenging': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
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
                <Bike className="h-8 w-8 text-primary" />
                <Flag className="h-6 w-6 text-blue-600" />
              </div> */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Current Drives Management
                </h1>
                <p className="text-muted-foreground">Manage upcoming rides and events</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => saveDrive(drivesData)}  variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Drive
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Bike className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{drivesData.length}</div>
                  <div className="text-sm text-muted-foreground">Total Drives</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {drivesData.reduce((sum, item) => sum + (item.participants || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Participants</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <TreePine className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {drivesData.reduce((sum, item) => sum + (item.treesTarget || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Trees Target</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {drivesData.filter(item => item.status === 'upcoming').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Bike className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Filters:</span>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => setFilterStatus('all')}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Drives List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle>Current Drives</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredData.map((item) => (
                <Card key={item.id} className="border-2 border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Drive Logo */}
                        {item.logo && (
                          <div className="flex-shrink-0">
                            <Image
                              src={item.logo}
                              alt="Drive Logo"
                              width={80}
                              height={80}
                              className="rounded-lg object-cover border-2 border-border"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-foreground">
                              {item.title}
                            </h3>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                            <Badge className={getDifficultyColor(item.difficulty)}>
                              {item.difficulty}
                            </Badge>
                            {item.registrationOpen && (
                              <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-600 dark:text-green-400">
                                Registration Open
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{item.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{item.participants || 0} riders</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TreePine className="h-4 w-4" />
                              <span>{item.treesTarget || 0} trees</span>
                            </div>
                          </div>
                          
                          <p className="text-muted-foreground mb-3">{item.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <div>Organizer: {item.organizer}</div>
                            <div>Duration: {item.duration}</div>
                            <div>Meeting: {item.meetingPoint}</div>
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
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                {editingItem ? 'Edit Drive' : 'Add New Drive'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Logo Upload Section */}
              <div className="space-y-2">
                <Label htmlFor="logo">Drive Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a logo for this drive (max 5MB, image files only)
                    </p>
                  </div>
                  {logoPreview && (
                    <div className="flex-shrink-0">
                      <Image
                        src={logoPreview}
                        alt="Logo Preview"
                        width={60}
                        height={60}
                        className="rounded-lg object-cover border-2 border-border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Drive Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter drive title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="City, Country"
                    required
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
                    required
                  />
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
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select onValueChange={(value) => setFormData({...formData, difficulty: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="participants">Expected Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    min="0"
                    value={formData.participants}
                    onChange={(e) => setFormData({...formData, participants: e.target.value})}
                    placeholder="Number of riders"
                  />
                </div>
                <div>
                  <Label htmlFor="treesTarget">Trees Target</Label>
                  <Input
                    id="treesTarget"
                    type="number"
                    min="0"
                    value={formData.treesTarget}
                    onChange={(e) => setFormData({...formData, treesTarget: e.target.value})}
                    placeholder="Trees to plant"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="e.g., 6 hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizer">Organizer *</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => setFormData({...formData, organizer: e.target.value})}
                    placeholder="Organizing club/person"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="contact@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationDeadline">Registration Deadline</Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({...formData, registrationDeadline: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="meetingPoint">Meeting Point</Label>
                  <Input
                    id="meetingPoint"
                    value={formData.meetingPoint}
                    onChange={(e) => setFormData({...formData, meetingPoint: e.target.value})}
                    placeholder="Starting location"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the drive and its objectives"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="registrationOpen"
                  checked={formData.registrationOpen}
                  onChange={(e) => setFormData({...formData, registrationOpen: e.target.checked})}
                />
                <Label htmlFor="registrationOpen">Registration Open</Label>
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
                  {editingItem ? 'Update' : 'Add'} Drive
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}