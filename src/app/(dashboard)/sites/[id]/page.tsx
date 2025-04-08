'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, RefreshCw, Trash, AlertTriangle, BarChart, Link2, ExternalLink, Clock, CheckCircle } from 'lucide-react';
import { Button, Badge, Loading } from '@/components/ui';

// Types
interface SiteConnection {
  id: string;
  user_id: string;
  site_id: string;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  credentials?: Record<string, any>;
  site: {
    id: string;
    name: string;
    url: string;
    logo_url: string;
    api_endpoint?: string;
  };
  stats: {
    total: number;
    active: number;
    draft: number;
    sold: number;
  };
}

export default function SiteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [site, setSite] = useState<SiteConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchSiteDetails();
  }, [params.id]);

  const fetchSiteDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/sites/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Site connection not found');
        }
        throw new Error('Failed to fetch site details');
      }
      
      const data = await response.json();
      setSite(data);
    } catch (error: any) {
      console.error('Error fetching site details:', error);
      setError(error.message || 'An error occurred while fetching site details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleSyncNow = async () => {
    if (!site || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      // Call the sync API
      const response = await fetch('/api/sites/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteId: params.id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync site');
      }
      
      // Refresh the data after successful sync
      await fetchSiteDetails();
    } catch (error: any) {
      console.error('Error syncing site:', error);
      alert(error.message || 'An error occurred while syncing the site');
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleDisconnect = async () => {
    if (!site) return;
    
    setIsDisconnecting(true);
    
    try {
      // Call the disconnect API
      const response = await fetch(`/api/sites/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to disconnect site');
      }
      
      // Redirect to sites page on successful disconnection
      router.push('/sites');
    } catch (error: any) {
      console.error('Error disconnecting site:', error);
      alert(error.message || 'An error occurred while disconnecting the site');
      setIsDisconnecting(false);
      setShowDisconnectConfirm(false);
    }
  };
  
  const getStatusBadge = (isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="danger" className="flex items-center gap-1"><AlertTriangle size={14} /> Error</Badge>;
    }
    
    if (isSyncing) {
      return <Badge variant="primary" className="flex items-center gap-1"><RefreshCw size={14} className="animate-spin" /> Syncing</Badge>;
    }
    
    return <Badge variant="success" className="flex items-center gap-1"><CheckCircle size={14} /> Connected</Badge>;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/sites" className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sites
          </Link>
        </div>
        
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    );
  }
  
  if (error || !site) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/sites" className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sites
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-medium text-red-600 dark:text-red-400">{error || 'Site Not Found'}</h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">The site you're looking for doesn't exist or you don't have access to it.</p>
          <div className="mt-6">
            <Button onClick={() => router.push('/sites')}>
              Return to Sites
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/sites" className="inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Sites
        </Link>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {site.site.logo_url ? (
              <img src={site.site.logo_url} alt={site.site.name} className="h-full w-full object-contain" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-500 dark:text-gray-300">
                  {site.site.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-5">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{site.site.name}</h1>
            <div className="mt-2 flex items-center">
              {getStatusBadge(site.is_active)}
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                Connected on {formatDate(site.created_at)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 space-x-3 flex">
          <Button 
            variant="primary" 
            className="flex items-center"
            onClick={handleSyncNow}
            isLoading={isSyncing}
            disabled={isSyncing || !site.is_active}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
          <Button 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
            onClick={() => setShowDisconnectConfirm(true)}
          >
            <Trash className="h-4 w-4 mr-1" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Disconnect Confirmation */}
      {showDisconnectConfirm && (
        <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Disconnect {site.site.name}?</h3>
                <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                  This will disconnect your account from {site.site.name}. Your listings will remain on the platform, but you won't be able to manage them from this dashboard until you reconnect.
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-6 flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDisconnectConfirm(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                size="sm"
                isLoading={isDisconnecting}
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sync Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sync Status</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last synced</p>
                  <p className="mt-1 text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-400" />
                    {formatDate(site.last_synced_at)}
                  </p>
                </div>
                
                <div className="mt-4 sm:mt-0">
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Listings</p>
                      <p className="mt-1 text-xl font-medium text-gray-900 dark:text-white">{site.stats.total}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-2">
                      <p className="text-xs text-green-600 dark:text-green-400">Active</p>
                      <p className="mt-1 text-xl font-medium text-gray-900 dark:text-white">{site.stats.active}</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-4 py-2">
                      <p className="text-xs text-yellow-600 dark:text-yellow-400">Draft</p>
                      <p className="mt-1 text-xl font-medium text-gray-900 dark:text-white">{site.stats.draft}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-2">
                      <p className="text-xs text-blue-600 dark:text-blue-400">Sold</p>
                      <p className="mt-1 text-xl font-medium text-gray-900 dark:text-white">{site.stats.sold}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View and manage all listings from this site
                  </p>
                  <Link href={`/listings?platform=${site.site_id}`}>
                    <Button variant="outline" size="sm">
                      View Listings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Connection Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Connection Details</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Connection ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{site.id}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                    {site.is_active ? 'Active' : 'Inactive'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Connection Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(site.created_at)}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white">{formatDate(site.updated_at)}</dd>
                </div>
                
                {site.site.api_endpoint && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">API Endpoint</dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono">{site.site.api_endpoint}</dd>
                  </div>
                )}
              </dl>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <a 
                  href={site.site.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Visit {site.site.name}
                  <ExternalLink className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link href={`/listings/new?platform=${site.site_id}`}>
                <Button className="w-full justify-center">
                  Create New Listing
                </Button>
              </Link>
              
              <Link href={`/listings?platform=${site.site_id}&status=active`}>
                <Button variant="outline" className="w-full justify-center">
                  View Active Listings
                </Button>
              </Link>
              
              <Link href={`/listings?platform=${site.site_id}&status=draft`}>
                <Button variant="outline" className="w-full justify-center">
                  View Draft Listings
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Help & Resources */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Help & Resources</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                <li>
                  <a 
                    href="#" 
                    className="flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    How to manage listings on {site.site.name}
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Troubleshooting connection issues
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    className="flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    {site.site.name} seller guidelines
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 