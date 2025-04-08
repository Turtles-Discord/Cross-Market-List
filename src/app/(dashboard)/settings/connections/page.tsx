'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, ExternalLink, Check, X, AlertTriangle, Link2, Settings } from 'lucide-react';
import { Button, Badge } from '@/components/ui';

// Define types for platforms
type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error';

interface PlatformConnection {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: ConnectionStatus;
  connectedAt: string | null;
  username?: string;
  shop?: string;
  stats?: {
    listings: number;
    views: number;
    messages: number;
  };
  error?: string;
}

// Mock platform data
const PLATFORMS: PlatformConnection[] = [
  {
    id: 'facebook',
    name: 'Facebook Marketplace',
    description: 'List your items on Facebook Marketplace to reach local buyers through Facebook\'s network.',
    logo: '/platforms/facebook.svg',
    status: 'connected',
    connectedAt: '2023-11-10T09:30:00Z',
    username: 'john.smith',
    stats: {
      listings: 12,
      views: 345,
      messages: 8
    }
  },
  {
    id: 'ebay',
    name: 'eBay',
    description: 'Connect to eBay to list products to millions of buyers worldwide.',
    logo: '/platforms/ebay.svg',
    status: 'connected',
    connectedAt: '2023-11-08T14:15:00Z',
    username: 'jsmith_trader',
    shop: 'JSmith Trading Co.',
    stats: {
      listings: 8,
      views: 214,
      messages: 3
    }
  },
  {
    id: 'offerup',
    name: 'OfferUp',
    description: 'Local marketplace app that lets you buy and sell items locally.',
    logo: '/platforms/offerup.svg',
    status: 'connected',
    connectedAt: '2023-11-05T11:20:00Z',
    username: 'john.s',
    stats: {
      listings: 5,
      views: 97,
      messages: 2
    }
  },
  {
    id: 'craigslist',
    name: 'Craigslist',
    description: 'Connect to Craigslist to post your items to local classified ads.',
    logo: '/platforms/craigslist.svg',
    status: 'disconnected',
    connectedAt: null
  },
  {
    id: 'etsy',
    name: 'Etsy',
    description: 'Marketplace for handmade, vintage, and craft supplies.',
    logo: '/platforms/etsy.svg',
    status: 'disconnected',
    connectedAt: null
  },
  {
    id: 'mercari',
    name: 'Mercari',
    description: 'Sell almost anything from your phone with this user-friendly app.',
    logo: '/platforms/mercari.svg',
    status: 'disconnected',
    connectedAt: null
  },
  {
    id: 'poshmark',
    name: 'Poshmark',
    description: 'Social marketplace for fashion and home goods.',
    logo: '/platforms/poshmark.svg',
    status: 'error',
    connectedAt: '2023-11-01T10:00:00Z',
    username: 'john_smith',
    error: 'Authentication token expired. Please reconnect your account.'
  }
];

export default function ConnectionsPage() {
  const [platforms, setPlatforms] = useState<PlatformConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'connected' | 'disconnected'>('all');
  
  useEffect(() => {
    // Simulate API call
    const loadPlatforms = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPlatforms(PLATFORMS);
      } catch (error) {
        console.error('Error loading platforms:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlatforms();
  }, []);
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusBadge = (status: ConnectionStatus) => {
    switch(status) {
      case 'connected':
        return <Badge variant="success" className="flex items-center"><Check className="h-3 w-3 mr-1" /> Connected</Badge>;
      case 'disconnected':
        return <Badge variant="default" className="flex items-center"><X className="h-3 w-3 mr-1" /> Not Connected</Badge>;
      case 'pending':
        return <Badge variant="primary" className="flex items-center"><Link2 className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'error':
        return <Badge variant="danger" className="flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };
  
  const handleConnect = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    // In a real app, this would open an OAuth flow or similar
    alert(`This would initiate the connection process for ${platform.name}. In a real app, this would open an OAuth flow in a popup or redirect.`);
    
    // Simulate connection process
    const updatedPlatforms = platforms.map(p => 
      p.id === platformId 
        ? { ...p, status: 'pending' as ConnectionStatus } 
        : p
    );
    
    setPlatforms(updatedPlatforms);
    
    // Simulate connection completion
    setTimeout(() => {
      const finalPlatforms = platforms.map(p => 
        p.id === platformId 
          ? { 
              ...p, 
              status: 'connected' as ConnectionStatus, 
              connectedAt: new Date().toISOString(),
              username: 'test_user',
              stats: { listings: 0, views: 0, messages: 0 }
            } 
          : p
      );
      setPlatforms(finalPlatforms);
    }, 2000);
  };
  
  const handleDisconnect = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    if (window.confirm(`Are you sure you want to disconnect from ${platform.name}? All existing listings will be removed from this platform.`)) {
      // In a real app, this would call an API to revoke access tokens
      const updatedPlatforms = platforms.map(p => 
        p.id === platformId 
          ? { 
              ...p, 
              status: 'disconnected' as ConnectionStatus,
              connectedAt: null,
              username: undefined,
              shop: undefined,
              stats: undefined,
              error: undefined
            } 
          : p
      );
      
      setPlatforms(updatedPlatforms);
    }
  };
  
  const handleReconnect = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;
    
    // Similar to connect but for fixing errors
    const updatedPlatforms = platforms.map(p => 
      p.id === platformId 
        ? { 
            ...p, 
            status: 'connected' as ConnectionStatus,
            error: undefined,
            connectedAt: new Date().toISOString()
          } 
        : p
    );
    
    setPlatforms(updatedPlatforms);
  };
  
  const filteredPlatforms = platforms.filter(platform => {
    if (filter === 'all') return true;
    if (filter === 'connected') return platform.status === 'connected';
    if (filter === 'disconnected') return platform.status !== 'connected';
    return true;
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/settings" className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Settings
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Connections</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex">
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/settings" className="inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Settings
        </Link>
      </div>
      
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Connections</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Connect to various selling platforms to manage your listings from one place.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button 
            variant={filter === 'all' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'connected' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('connected')}
          >
            Connected
          </Button>
          <Button 
            variant={filter === 'disconnected' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => setFilter('disconnected')}
          >
            Available
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {filteredPlatforms.map(platform => (
          <div 
            key={platform.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-shrink-0 h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {/* This would be an actual image in a real app */}
                  <span className="text-2xl font-bold text-gray-500 dark:text-gray-300">
                    {platform.name.charAt(0)}
                  </span>
                </div>
                
                <div className="mt-4 md:mt-0 md:ml-6 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                        {platform.name}
                        {platform.status === 'connected' && (
                          <ExternalLink className="ml-2 h-4 w-4 text-gray-400" />
                        )}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {platform.description}
                      </p>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                      {getStatusBadge(platform.status)}
                      
                      {platform.status === 'connected' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="ml-2" 
                          onClick={() => handleDisconnect(platform.id)}
                        >
                          Disconnect
                        </Button>
                      )}
                      
                      {platform.status === 'disconnected' && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          className="ml-2"
                          onClick={() => handleConnect(platform.id)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      )}
                      
                      {platform.status === 'error' && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => handleReconnect(platform.id)}
                        >
                          Reconnect
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {platform.status === 'connected' && (
                    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Details</h3>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="text-gray-700 dark:text-gray-300">
                              <span className="font-medium">Username:</span> {platform.username}
                            </p>
                            {platform.shop && (
                              <p className="text-gray-700 dark:text-gray-300">
                                <span className="font-medium">Shop Name:</span> {platform.shop}
                              </p>
                            )}
                            <p className="text-gray-700 dark:text-gray-300">
                              <span className="font-medium">Connected:</span> {formatDate(platform.connectedAt)}
                            </p>
                          </div>
                        </div>
                        
                        {platform.stats && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Statistics</h3>
                            <div className="mt-2 grid grid-cols-3 gap-4">
                              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Listings</p>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{platform.stats.listings}</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{platform.stats.views}</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400">Messages</p>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">{platform.stats.messages}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {platform.status === 'connected' && (
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Platform Settings
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {platform.status === 'error' && platform.error && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div className="ml-3">
                          <p className="text-sm text-red-700 dark:text-red-400">
                            {platform.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPlatforms.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No platforms found matching your filter. 
              <Button 
                variant="outline" 
                className="ml-1"
                onClick={() => setFilter('all')}
              >
                View all platforms
              </Button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 