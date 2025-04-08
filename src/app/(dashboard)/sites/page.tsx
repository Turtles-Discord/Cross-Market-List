'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, CheckCircle, AlertTriangle, RefreshCw, Settings } from 'lucide-react';
import { Button, Badge, Loading } from '@/components/ui';
import { getUserSubscription } from '@/lib/db/utils';

// Constants
const MAX_FREE_SITES = 3;

// Types
interface ConnectedSite {
  id: string;
  user_id: string;
  site_id: string;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  credentials?: Record<string, any>;
  sites: {
    id: string;
    name: string;
    url: string;
    logo_url: string;
  };
  // Calculated stats from API
  stats?: {
    total: number;
    active: number;
    draft: number;
    sold: number;
  };
}

interface AvailableSite {
  id: string;
  name: string;
  url: string;
  logo_url: string;
  api_endpoint?: string;
  description?: string;
}

interface UserInfo {
  planType: 'free' | 'pro';
  connectedSitesCount: number;
}

export default function SitesPage() {
  const [connectedSites, setConnectedSites] = useState<ConnectedSite[]>([]);
  const [availableSites, setAvailableSites] = useState<AvailableSite[]>([]);
  const [user, setUser] = useState<UserInfo>({ planType: 'free', connectedSitesCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingSiteId, setSyncingSiteId] = useState<string | null>(null);
  
  // Whether the user can connect more sites based on their plan
  const canConnectMoreSites = user.planType === 'pro' || connectedSites.length < MAX_FREE_SITES;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch connected sites
      const connectedRes = await fetch('/api/sites/connected');
      if (!connectedRes.ok) {
        throw new Error('Failed to fetch connected sites');
      }
      const connectedData = await connectedRes.json();
      setConnectedSites(connectedData || []);
      
      // Fetch available sites
      const availableRes = await fetch('/api/sites/available');
      if (!availableRes.ok) {
        throw new Error('Failed to fetch available sites');
      }
      const availableData = await availableRes.json();
      
      // Add descriptions to available sites if they don't have one
      const enhancedAvailableSites = availableData.map((site: AvailableSite) => ({
        ...site,
        description: site.description || `Connect to ${site.name} to manage your listings.`
      }));
      
      setAvailableSites(enhancedAvailableSites || []);
      
      // Determine user's subscription plan
      // In a real app, this would come from an API call
      // For now, we'll assume free plan if they have fewer than 3 connected sites
      const userPlan: UserInfo = {
        planType: connectedData.length >= MAX_FREE_SITES ? 'pro' : 'free',
        connectedSitesCount: connectedData.length
      };
      
      setUser(userPlan);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load site data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than an hour ago';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };
  
  const getStatusBadge = (site: ConnectedSite) => {
    if (!site.is_active) {
      return <Badge variant="danger" className="flex items-center gap-1"><AlertTriangle size={14} /> Error</Badge>;
    }
    
    if (syncingSiteId === site.site_id) {
      return <Badge variant="primary" className="flex items-center gap-1"><RefreshCw size={14} className="animate-spin" /> Syncing</Badge>;
    }
    
    return <Badge variant="success" className="flex items-center gap-1"><CheckCircle size={14} /> Connected</Badge>;
  };
  
  const handleSyncSite = async (siteId: string) => {
    // Prevent multiple syncs at once
    if (syncingSiteId) return;
    
    setSyncingSiteId(siteId);
    
    try {
      // Call the sync API
      const response = await fetch('/api/sites/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siteId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sync site');
      }
      
      // Refresh the data after successful sync
      await fetchData();
    } catch (error: any) {
      console.error('Error syncing site:', error);
      
      // Show error notification or update UI as needed
      alert(error.message || 'An error occurred while syncing the site');
    } finally {
      setSyncingSiteId(null);
    }
  };
  
  const handleReconnect = (siteId: string) => {
    // In a real implementation, this would redirect to a reconnect flow
    // For now, just redirect to the connect page with the site ID
    window.location.href = `/sites/connect?siteId=${siteId}`;
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connected Sites</h1>
          <div className="mt-4 sm:mt-0 animate-pulse">
            <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connected Sites</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your marketplace connections and sync your listings.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/sites/connect">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Connect New Site
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Connected Sites Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Connected Sites ({connectedSites.length}/{user.planType === "free" ? MAX_FREE_SITES : "∞"})
          </h2>
          
          {connectedSites.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No sites connected</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Connect your first listing site to get started.</p>
              <div className="mt-6">
                <Link href="/sites/connect">
                  <Button>
                    Connect a Site
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connectedSites.map(site => (
                <div key={site.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                          {site.sites.logo_url ? (
                            <img src={site.sites.logo_url} alt={site.sites.name} className="h-full w-full object-contain" />
                          ) : (
                            <span className="text-xl font-bold text-gray-500 dark:text-gray-300">
                              {site.sites.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {site.sites.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Last synced: {formatDate(site.last_synced_at)}
                          </p>
                          <div className="mt-2">
                            {getStatusBadge(site)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 sm:mt-0 flex flex-col sm:items-end">
                        <Link href={`/sites/${site.site_id}`}>
                          <Button variant="outline" size="sm" className="flex items-center mb-2 w-full sm:w-auto">
                            <Settings className="w-4 h-4 mr-1" />
                            Settings
                          </Button>
                        </Link>
                        {!site.is_active ? (
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="w-full sm:w-auto"
                            onClick={() => handleReconnect(site.site_id)}
                          >
                            Reconnect
                          </Button>
                        ) : (
                          <Button 
                            variant="primary" 
                            size="sm"
                            isLoading={syncingSiteId === site.site_id}
                            disabled={syncingSiteId === site.site_id || !!syncingSiteId}
                            onClick={() => handleSyncSite(site.site_id)}
                            className="w-full sm:w-auto"
                          >
                            <RefreshCw className={`w-4 h-4 mr-1 ${syncingSiteId === site.site_id ? 'animate-spin' : ''}`} />
                            Sync Now
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Active Listings</span>
                          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {site.stats?.active || 0}
                          </p>
                        </div>
                        <Link href={`/listings?platform=${site.site_id}`} className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                          View Listings 
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Available Sites Section */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Available Platforms</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {availableSites
                .filter(site => !connectedSites.some(cs => cs.site_id === site.id))
                .map((site) => (
                <li key={site.id} className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
                      {site.logo_url && (
                        <img src={site.logo_url} alt={site.name} className="h-10 w-10 object-contain" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">{site.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{site.description}</p>
                    </div>
                  </div>
                  <Link href={canConnectMoreSites ? `/sites/connect?siteId=${site.id}` : "/subscription"}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!canConnectMoreSites}
                    >
                      {canConnectMoreSites ? "Connect" : "Upgrade to Connect"}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Plan Upgrade CTA - Show only for free users who have reached their limit */}
        {user.planType === 'free' && connectedSites.length >= MAX_FREE_SITES && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8 md:px-10 md:py-10 md:flex md:items-center md:justify-between">
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold text-white">Reached your connection limit?</h2>
                <p className="mt-2 text-white text-opacity-90">
                  Upgrade to our Pro plan for unlimited site connections, automatic syncing, and more features.
                </p>
              </div>
              <div className="mt-6 md:mt-0 text-center md:text-right">
                <Link href="/subscription">
                  <Button variant="secondary" className="shadow-sm px-6">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 