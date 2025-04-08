'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Check, ExternalLink } from 'lucide-react';
import { Button, Loading } from '@/components/ui';

interface AvailableSite {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  url: string;
  is_connected?: boolean;
  auth_url?: string;
}

export default function ConnectSitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get('siteId');
  const reconnect = searchParams.get('reconnect') === 'true';
  
  const [sites, setSites] = useState<AvailableSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<AvailableSite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableSites();
  }, []);

  useEffect(() => {
    if (sites.length > 0 && siteId) {
      const site = sites.find(s => s.id === siteId);
      if (site) {
        setSelectedSite(site);
      }
    }
  }, [sites, siteId]);

  const fetchAvailableSites = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/sites/available');
      
      if (!response.ok) {
        throw new Error('Failed to fetch available sites');
      }
      
      const data = await response.json();
      setSites(data);
    } catch (error: any) {
      console.error('Error fetching available sites:', error);
      setError(error.message || 'An error occurred while fetching available sites');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSiteSelect = (site: AvailableSite) => {
    setSelectedSite(site);
    setError(null);
    setSuccess(null);
  };

  const handleConnect = async () => {
    if (!selectedSite) return;
    
    setIsConnecting(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (selectedSite.auth_url) {
        // For sites that require OAuth, redirect to the auth URL
        window.location.href = selectedSite.auth_url;
        return;
      }
      
      // For sites that use direct connection
      const response = await fetch('/api/sites/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siteId: selectedSite.id,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to connect to site');
      }
      
      const data = await response.json();
      
      setSuccess(`Successfully connected to ${selectedSite.name}`);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/sites/${data.siteId}`);
      }, 1500);
    } catch (error: any) {
      console.error('Error connecting to site:', error);
      setError(error.message || 'An error occurred while connecting to the site');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/sites" className="inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Sites
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {reconnect ? 'Reconnect to Platform' : 'Connect to a New Platform'}
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
          <div className="flex">
            <Check className="h-5 w-5 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site) => (
              <div
                key={site.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 cursor-pointer border-2 hover:border-blue-500 transition-colors ${
                  selectedSite?.id === site.id 
                    ? 'border-blue-500' 
                    : site.is_connected 
                      ? 'border-green-500' 
                      : 'border-transparent'
                }`}
                onClick={() => handleSiteSelect(site)}
              >
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex-shrink-0">
                    {site.logo_url ? (
                      <img 
                        src={site.logo_url} 
                        alt={site.name} 
                        className="h-full w-full object-contain" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-500 dark:text-gray-300">
                          {site.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      {site.name}
                      {site.is_connected && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Connected
                        </span>
                      )}
                    </h3>
                    <a 
                      href={site.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit site
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {site.description}
                </p>
              </div>
            ))}
          </div>

          {selectedSite && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Connect to {selectedSite.name}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {selectedSite.is_connected 
                  ? `You are already connected to ${selectedSite.name}. You can reconnect if you're experiencing issues.`
                  : `Click the button below to ${reconnect ? 'reconnect' : 'connect'} to ${selectedSite.name}. You may be redirected to ${selectedSite.name} to authorize access.`
                }
              </p>
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleConnect}
                isLoading={isConnecting}
                disabled={isConnecting}
              >
                {selectedSite.is_connected 
                  ? 'Reconnect' 
                  : reconnect 
                    ? 'Reconnect' 
                    : 'Connect'
                } to {selectedSite.name}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 