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
  BookOpen, Plus, Edit, Trash2, Save, X, Calendar, User,
  ArrowLeft, Bike, FileText, Eye, ExternalLink, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  blogURL: string;
  authorName: string;
  authorBio: string;
  authorAvatar: string;
  tags: string[];
  image: string;
  readTime: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  category: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogPage() {
  const [blogData, setBlogData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<BlogPost | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    blogURL: '',
    authorName: '',
    authorBio: '',
    authorAvatar: '',
    tags: '',
    image: '',
    readTime: '',
    featured: false,
    status: 'draft' as 'draft' | 'published' | 'archived',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Environment', 'Education', 'Community', 'Technology', 'Safety', 'Conservation'];
  const statuses = ['draft', 'published', 'archived'];

  // Load data from Google Sheets on component mount
  useEffect(() => {
    loadBlogData();
  }, []);

  // Load data from Google Sheets
  const loadBlogData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog');
      const result = await response.json();
      
      if (result.success) {
        setBlogData(result.data);
      } else {
        toast.error('Failed to load blog data');
        console.error('Error loading blog data:', result.error);
      }
    } catch (error) {
      toast.error('Failed to load blog data');
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save data to Google Sheets
  const saveBlogData = async (data: BlogPost[]) => {
    try {
      setSaving(true);
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blogs: data }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Blog data saved! Updated: ${result.updated}, Added: ${result.added}`);
        
        // Trigger real-time update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('adminDataUpdate', { 
            detail: { section: 'blog', data: data } 
          }));
        }
      } else {
        toast.error('Failed to save blog data');
        console.error('Error saving blog data:', result.error);
      }
    } catch (error) {
      toast.error('Failed to save blog data');
      console.error('Error saving blog data:', error);
    } finally {
      setSaving(false);
    }
  };

  // Export data to Excel
  const exportToExcel = () => {
    try {
      const exportData = blogData.map(item => ({
        ID: item.id,
        Title: item.title,
        Excerpt: item.excerpt,
        Content: item.content,
        'Blog URL': item.blogURL,
        'Author Name': item.authorName,
        'Author Bio': item.authorBio,
        'Author Avatar': item.authorAvatar,
        Tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags,
        Image: item.image,
        'Read Time': item.readTime,
        Featured: item.featured ? 'Yes' : 'No',
        Status: item.status,
        Category: item.category,
        Date: item.date,
        'Created At': item.createdAt,
        'Updated At': item.updatedAt,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Blog Posts');
      XLSX.writeFile(wb, `blog_posts_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast.success('Blog data exported to Excel!');
    } catch (error) {
      console.error('Error exporting blog data:', error);
      toast.error('Failed to export blog data');
    }
  };

  // Add new blog post
  const handleAdd = async () => {
    if (!formData.title || !formData.excerpt || !formData.content || !formData.blogURL) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate URL
    try {
      new URL(formData.blogURL);
    } catch {
      toast.error('Please enter a valid blog URL');
      return;
    }

    const newItem: BlogPost = {
      id: Date.now(),
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedData = [...blogData, newItem];
    setBlogData(updatedData);
    await saveBlogData(updatedData);
    
    resetForm();
    setIsAddingNew(false);
    toast.success('Blog post added successfully!');
  };

  // Edit blog post
  const handleEdit = (item: BlogPost) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      blogURL: item.blogURL,
      authorName: item.authorName,
      authorBio: item.authorBio,
      authorAvatar: item.authorAvatar,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags,
      image: item.image,
      readTime: item.readTime,
      featured: item.featured,
      status: item.status,
      category: item.category,
      date: item.date
    });
  };

  // Update blog post
  const handleUpdate = async () => {
    if (!formData.title || !formData.excerpt || !formData.content || !formData.blogURL) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate URL
    try {
      new URL(formData.blogURL);
    } catch {
      toast.error('Please enter a valid blog URL');
      return;
    }

    const updatedData = blogData.map(item => 
      item.id === editingItem?.id 
        ? {
            ...item,
            ...formData,
            tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    setBlogData(updatedData);
    await saveBlogData(updatedData);
    setEditingItem(null);
    resetForm();
    toast.success('Blog post updated successfully!');
  };

  // Delete blog post
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/blog?id=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        const updatedData = blogData.filter(item => item.id !== id);
        setBlogData(updatedData);
        toast.success('Blog post deleted successfully!');
      } else {
        toast.error('Failed to delete blog post');
      }
    } catch (error) {
      toast.error('Failed to delete blog post');
      console.error('Error deleting blog post:', error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '', excerpt: '', content: '', blogURL: '', authorName: '', authorBio: '', 
      authorAvatar: '', tags: '', image: '', readTime: '', featured: false, 
      status: 'draft', category: '', date: new Date().toISOString().split('T')[0]
    });
  };

  // Filter data
  const filteredData = blogData.filter(item => {
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if(loading){
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading blog data...</p>
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
            <div className="flex items-center space-x-3">
              {/* <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <Bike className="h-6 w-6 text-blue-600" />
              </div> */}
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Blog Management
                </h1>
                <p className="text-gray-600">Manage blog posts and articles</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => saveBlogData(blogData)} variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={() => setIsAddingNew(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Post
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-full">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{blogData.length}</div>
                  <div className="text-sm text-blue-600">Total Posts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {blogData.filter(item => item.status === 'published').length}
                  </div>
                  <div className="text-sm text-green-600">Published</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-yellow-500 rounded-full">
                  <Edit className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {blogData.filter(item => item.status === 'draft').length}
                  </div>
                  <div className="text-sm text-yellow-600">Drafts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500 rounded-full">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">
                    {new Set(blogData.map(item => item.authorName)).size}
                  </div>
                  <div className="text-sm text-purple-600">Authors</div>
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
                <BookOpen className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Filters:</span>
              </div>
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
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Button
                variant="outline"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardTitle>Blog Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {filteredData.map((item) => (
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
                                <User className="h-4 w-4" />
                                <span>{item.authorName}</span>
                              </div>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                              {item.featured && (
                                <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{item.excerpt}</p>
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(item.tags) ? item.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              )) : null}
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Blog Post' : 'Add New Blog Post'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Post Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter post title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category *</Label>
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
              </div>
              
              <div>
                <Label htmlFor="blogURL">Blog URL *</Label>
                <Input
                  type='url'
                  id="blogURL"
                  value={formData.blogURL}
                  onChange={(e) => setFormData({...formData, blogURL: e.target.value})}
                  placeholder="Enter Blog URL"
                />
              </div>
              
              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="Brief description of the post"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Full article content"
                  rows={8}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="authorName">Author Name *</Label>
                  <Input
                    id="authorName"
                    value={formData.authorName}
                    onChange={(e) => setFormData({...formData, authorName: e.target.value})}
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <Label htmlFor="authorBio">Author Bio</Label>
                  <Input
                    id="authorBio"
                    value={formData.authorBio}
                    onChange={(e) => setFormData({...formData, authorBio: e.target.value})}
                    placeholder="Author bio"
                  />
                </div>
                <div>
                  <Label htmlFor="readTime">Read Time</Label>
                  <Input
                    id="readTime"
                    value={formData.readTime}
                    onChange={(e) => setFormData({...formData, readTime: e.target.value})}
                    placeholder="e.g., 5 min read"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="image">Featured Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="Enter image URL"
                  />
                </div>
                <div>
                  <Label htmlFor="authorAvatar">Author Avatar URL</Label>
                  <Input
                    id="authorAvatar"
                    value={formData.authorAvatar}
                    onChange={(e) => setFormData({...formData, authorAvatar: e.target.value})}
                    placeholder="Enter author avatar URL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select onValueChange={(value) => setFormData({...formData, status: value as 'draft' | 'published' | 'archived'})}>
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
                  <Label htmlFor="date">Publish Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  />
                  <Label htmlFor="featured">Featured Post</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="e.g., Environment, Sustainability, Riding"
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
                  {editingItem ? 'Update' : 'Add'} Post
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}