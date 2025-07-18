'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, Plus, Edit, Trash2, Save, X, Shield, Key,
  ArrowLeft, Bike, UserPlus, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';

// Initial admin data
const initialAdminData = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@saveearthride.com',
    password: 'saveearthride2024',
    role: 'Super Admin',
    createdAt: '2024-01-01',
    lastLogin: '2024-12-15',
    status: 'active'
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@saveearthride.com',
    password: 'manager123',
    role: 'Manager',
    createdAt: '2024-06-15',
    lastLogin: '2024-12-10',
    status: 'active'
  }
];

export default function AdminManagementPage() {
  const [adminData, setAdminData] = useState(initialAdminData);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showPassword, setShowPassword] = useState<{[key: number]: boolean}>({});
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Admin',
    status: 'active'
  });

  const roles = ['Super Admin', 'Admin', 'Manager', 'Editor'];
  const statuses = ['active', 'inactive', 'suspended'];

  // Load data from localStorage on component mount
  useEffect(() => {
    loadDataFromServer();
  }, []);

  // Load data from localStorage
  const loadDataFromServer = async () => {
    // try {
    //   const savedData = localStorage.getItem('adminData');
    //   if (savedData) {
    //     setAdminData(JSON.parse(savedData));
    //   }
    // } catch (error) {
    //   console.error('Error loading admin data:', error);
    // }
    try{
      const res = await fetch('/api/admins');
      const json = await res.json();
      setAdminData(json.data);
    } catch (error) {
      toast.error('Failed to load admin');
      console.error(error);
    }
  };
  
  const saveDataToServer = async (data: any[]) => {
    try{
      console.log("RUNNING THE SAVE DATA TO SERVER ");
      await fetch('/api/admins',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      toast.success('Admin data saved!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save admin data');
    }
  }
  
  // Save data to file and localStorage
  const saveDataToFile = (data: any[]) => {
    try {
      // Save to localStorage for persistence
      localStorage.setItem('adminData', JSON.stringify(data));
      
      // Create downloadable file
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `admin_data_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Also export to Excel
      const ws = XLSX.utils.json_to_sheet(data.map(item => ({
        ...item,
        password: '***HIDDEN***' // Hide passwords in Excel
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Admins');
      XLSX.writeFile(wb, `admin_data_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Admin data saved to file!');
    } catch (error) {
      console.error('Error saving admin data:', error);
      toast.error('Failed to save admin data');
    }
  };

  // Real-time update function
  const updateAdminData = (newData: any[]) => {
    console.log("RUNNING THE UPDATE ADMIN DATA TO SERVER ");
    setAdminData(newData);
    saveDataToServer(newData);
    
    // Trigger real-time update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('adminDataUpdate', { 
        detail: { section: 'admins', data: newData } 
      }));
    }
  };

  // Add new admin
  const handleAdd = () => {
    console.log("RUNNING THE ADDING FUNCTION ");
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      console.log("RUNNING THE ADDING 1 FUNCTION ");
      return;
    }

    // Check if username already exists
    if (adminData.some(admin => admin.username === formData.username)) {
      toast.error('Username already exists');
      console.log("RUNNING THE ADDING 2 FUNCTION ");
      return;
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Never'
    };

    const updatedData = [...adminData, newItem];
    console.log("RUNNING THE update 3 FUNCTION ");
    updateAdminData(updatedData);
    
    resetForm();
    setIsAddingNew(false);
    toast.success('Admin added successfully!');
  };

  // Edit admin
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      username: item.username,
      email: item.email,
      password: item.password,
      role: item.role,
      status: item.status
    });
  };

  // Update admin
  const handleUpdate = () => {
    console.log("RUNNING THE UPDATE FUNCTION TO SERVER ");
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedData = adminData.map(item => 
      item.id === editingItem.id 
        ? { ...item, ...formData }
        : item
    );

    updateAdminData(updatedData);
    setEditingItem(null);
    resetForm();
    toast.success('Admin updated successfully!');
  };

  // Delete admin
  const handleDelete = (id: number) => {
    if (adminData.length === 1) {
      toast.error('Cannot delete the last admin');
      return;
    }
    
    const updatedData = adminData.filter(item => item.id !== id);
    updateAdminData(updatedData);
    toast.success('Admin deleted successfully!');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: '', email: '', password: '', role: 'Admin', status: 'active'
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = (id: number) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin': return 'bg-red-100 text-red-800';
      case 'Admin': return 'bg-blue-100 text-blue-800';
      case 'Manager': return 'bg-green-100 text-green-800';
      case 'Editor': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
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
                <Shield className="h-8 w-8 text-primary" />
                <Bike className="h-6 w-6 text-blue-600" />
              </div> */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Admin Management
                </h1>
                <p className="text-gray-600">Manage admin users and permissions</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => saveDataToServer(adminData)} variant="outline">
              <Shield className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{adminData.length}</div>
                  <div className="text-sm text-blue-600">Total Admins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {adminData.filter(item => item.status === 'active').length}
                  </div>
                  <div className="text-sm text-green-600">Active Admins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-500 rounded-full">
                  <Key className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-700">
                    {adminData.filter(item => item.role === 'Super Admin').length}
                  </div>
                  <div className="text-sm text-red-600">Super Admins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">
                    {adminData.filter(item => item.lastLogin === 'Never').length}
                  </div>
                  <div className="text-sm text-purple-600">New Admins</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admins List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle>Admin Users</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {adminData.map((item) => (
                <Card key={item.id} className="border-2 border-gray-200 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {item.username}
                          </h3>
                          <Badge className={getRoleColor(item.role)}>
                            {item.role}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div>Email: {item.email}</div>
                          <div className="flex items-center space-x-2">
                            <span>Password:</span>
                            <span className="font-mono">
                              {showPassword[item.id] ? item.password : '••••••••'}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePasswordVisibility(item.id)}
                              className="h-6 w-6 p-0"
                            >
                              {showPassword[item.id] ? 
                                <EyeOff className="h-3 w-3" /> : 
                                <Eye className="h-3 w-3" />
                              }
                            </Button>
                          </div>
                          <div>Created: {item.createdAt}</div>
                          <div>Last Login: {item.lastLogin}</div>
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
                          disabled={adminData.length === 1}
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Admin User' : 'Add New Admin User'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Enter password"
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
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
                  {editingItem ? 'Update' : 'Add'} Admin
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}