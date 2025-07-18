'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Calendar, User, ArrowRight, TreePine, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Define the blog post interface to match your Google Sheets structure
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

// Transform the Google Sheets data to match the component's expected structure
const transformBlogPost = (post: BlogPost) => ({
  id: post.id,
  title: post.title,
  excerpt: post.excerpt,
  content: post.content,
  blogURL: post.blogURL,
  author: {
    name: post.authorName,
    avatar: post.authorAvatar,
    bio: post.authorBio,
  },
  date: post.date,
  tags: post.tags,
  image: post.image,
  readTime: post.readTime,
  featured: post.featured,
  status: post.status,
  category: post.category,
});

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog posts from Google Sheets API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/blog');
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Filter only published posts for the public blog page
          const publishedPosts = data.data.filter((post: BlogPost) => post.status === 'published');
          setBlogPosts(publishedPosts);
        } else {
          throw new Error(data.error || 'Failed to fetch blog posts');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Transform blog posts for component usage
  const transformedPosts = blogPosts.map(transformBlogPost);

  // Get all unique tags from the fetched posts
  const allTags = [...new Set(transformedPosts.flatMap(post => post.tags))];
  
  // Filter posts based on search query and selected tag
  const filteredPosts = transformedPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const featuredPost = filteredPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Environmental Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, stories, and knowledge from our global community of environmental riders.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="relative flex-1 mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-1/2 mx-auto"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={!selectedTag ? "default" : "outline"}
                onClick={() => setSelectedTag('')}
                size="sm"
              >
                All Topics
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                  size="sm"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-12">
            <Card className="overflow-hidden border-0 shadow-lg">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <Badge className="mb-4 bg-primary/10 text-primary">
                    <TreePine className="h-3 w-3 mr-1" />
                    Featured Article
                  </Badge>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex items-center space-x-4 mb-6">
                    <Avatar>
                      <AvatarImage src={featuredPost.author.avatar} alt={featuredPost.author.name} />
                      <AvatarFallback>
                        {featuredPost.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{featuredPost.author.name}</p>
                      <p className="text-sm text-gray-600">{featuredPost.author.bio}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(featuredPost.date).toLocaleDateString()}
                      </span>
                      <span>{featuredPost.readTime}</span>
                    </div>
                    <Button asChild>
                      <Link href={featuredPost.blogURL || '#'} className="flex items-center">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map(post => (
            <Card key={post.id} className="card-hover border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {post.tags[0]}
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback>
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author.name}</p>
                      <p className="text-xs text-gray-500">{post.author.bio}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No posts found message */}
        {filteredPosts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No published articles found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}