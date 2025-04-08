'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, User, Mail, MapPin, Phone, Globe, Calendar, CheckCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter, Textarea } from '@/components/ui';

// Mock user data
const USER_DATA = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  phone: '+1 (555) 123-4567',
  location: 'New York, NY',
  bio: 'Passionate about finding great deals and selling unique items. I\'ve been using this platform to manage my online business across multiple marketplaces.',
  website: 'johnsmith.com',
  joinDate: '2023-05-15T10:30:00Z',
  avatar: null, // In a real app, this would be a URL
};

export default function ProfilePage() {
  const [formData, setFormData] = useState(USER_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset save status when form is changed
    if (isSaved) setIsSaved(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show saved status
      setIsSaved(true);
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/settings" className="inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update your personal information and how others see you on the platform
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This email will be used for notifications and account updates
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Website
                  </label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell others a bit about yourself..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Max 200 characters. Brief description for your profile.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Link href="/settings">
                  <Button variant="outline">Cancel</Button>
                </Link>
                
                <div className="flex items-center space-x-4">
                  {isSaved && (
                    <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Changes saved
                    </span>
                  )}
                  
                  <Button type="submit" isLoading={isLoading}>
                    Save Changes
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </div>
        
        {/* Right sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-4xl font-bold">
                  {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                </div>
                
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full">
                  <Upload className="h-4 w-4" />
                </button>
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload a new avatar
                </p>
                <div className="flex justify-center">
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Upload
                  </button>
                  <span className="border-r border-gray-300 dark:border-gray-700 mx-2"></span>
                  <button className="px-3 py-1 text-sm text-red-600 hover:text-red-500 dark:text-red-400">
                    Remove
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPG, GIF or PNG. Max size 2MB.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Full Name</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formData.firstName} {formData.lastName}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formData.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formData.location || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Globe className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Website</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formData.website ? (
                      <a 
                        href={`https://${formData.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {formData.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Joined</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(formData.joinDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 