'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Calendar, User, ArrowRight, TreePine } from 'lucide-react';
import Link from 'next/link';

const blogPosts = [
  {
    id: 1,
    title: 'The Environmental Impact of Motorcycle Tourism',
    excerpt: 'Exploring how motorcycle tourism can be transformed into a force for environmental conservation and sustainable travel.',
    content: 'Full article content here...',
    blogURL: '',
    author: {
      name: 'Dr. Sarah Green',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'Environmental Scientist',
    },
    date: '2024-10-12',
    tags: ['Environment', 'Tourism', 'Sustainability'],
    image: 'https://images.pexels.com/photos/1119796/pexels-photo-1119796.jpeg?auto=compress&cs=tinysrgb&w=600',
    readTime: '8 min read',
    featured: true,
  },
  {
    id: 2,
    title: 'Tree Planting Techniques for Urban Environments',
    excerpt: 'Learn about the best practices for planting trees in urban settings and how motorcycle clubs can make a difference.',
    content: 'Full article content here...',
    author: {
      name: 'Miguel Rodriguez',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'Urban Forestry Expert',
    },
    date: '2024-05-12',
    tags: ['Tree Planting', 'Urban Forestry', 'Community'],
    image: 'https://images.pexels.com/photos/1005648/pexels-photo-1005648.jpeg?auto=compress&cs=tinysrgb&w=600',
    readTime: '6 min read',
    featured: false,
  },
  {
    id: 6,
    title: 'Indigenous Wisdom in Environmental Conservation',
    excerpt: 'Learning from indigenous communities about sustainable living and environmental stewardship.',
    content: 'Full article content here...',
    author: {
      name: 'Maria Santos',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
      bio: 'Cultural Anthropologist',
    },
    date: '2024-08-11',
    tags: ['Indigenous', 'Wisdom', 'Conservation'],
    image: 'https://images.pexels.com/photos/1416530/pexels-photo-1416530.jpeg?auto=compress&cs=tinysrgb&w=600',
    readTime: '9 min read',
    featured: false,
  },
];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const allTags = [...new Set(blogPosts.flatMap(post => post.tags))];
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || post.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const featuredPost = filteredPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

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
          <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-full md:w-1/2 mx-auto pl-5" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-1/2 mx-auto"
              />
            </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex flex-wrap gap-2">
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
                  <Badge className="mb-4 bg-gray/80 dark:text-blue-500 text-primary">
                    {/* <TreePine className="h-3 w-3 mr-1" /> */}
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
                    <Button>
                      <Link href={{pathname: featuredPost.blogURL}} className="flex items-center">
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
            <Card key={post.id} className="card-hover border-0 shadow-lg ">
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

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">
              No articles found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}