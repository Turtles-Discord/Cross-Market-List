'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  ArrowLeft,
  Search,
  X,
  Settings,
  ChevronRight
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Badge, 
  Input,
  Loading,
  Select
} from '@/components/ui';

// Type definitions
type PlatformId = string;

type SyncStatus = 'synced' | 'not-synced' | 'error' | 'syncing' | 'not-connected';

interface StatusBadgeInfo {
  [key: string]: {
    variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    label: string;
    icon: React.ElementType;
  }
}

interface Platform {
  id: string;
  name: string;
  logo: string;
  connected: boolean;
  lastSync: string | null;
  listingsCount: number;
}

interface ListingItem {
  id: string;
  title: string;
  platforms: PlatformId[];
  status: {
    [key: string]: SyncStatus;
  };
}

interface SyncResult {
  site_id: string;
  site_name: string;
  success: boolean;
  listings_added: number;
  error?: string;
  message?: string;
  listings?: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export default function ListingSyncPage() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [hasSynced, setHasSynced] = useState(false);
  
  // Status badge mappings
  const statusBadge: StatusBadgeInfo = {
    'synced': { variant: 'success', label: 'Synced', icon: CheckCircle },
    'not-synced': { variant: 'warning', label: 'Not Synced', icon: Clock },
    'error': { variant: 'danger', label: 'Error', icon: AlertTriangle },
    'syncing': { variant: 'primary', label: 'Syncing...', icon: RefreshCw },
    'not-connected': { variant: 'default', label: 'Not Connected', icon: AlertTriangle }
  };

  // Fetch connected platforms and listings
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch connected sites
        const sitesResponse = await fetch('/api/sites/connected');
        if (!sitesResponse.ok) {
          throw new Error('Failed to fetch connected platforms');
        }
        
        const sitesData = await sitesResponse.json();
        
        // Format the data for the platforms state
        const platformsData = sitesData.map((site: any) => ({
          id: site.site_id,
          name: site.site.name,
          logo: site.site.logo_url || '/platforms/placeholder.svg',
          connected: site.is_active,
          lastSync: site.last_synced_at,
          listingsCount: 0 // Will be updated with the listings count
        }));
        
        setPlatforms(platformsData);
        
        // Fetch listings for all connected platforms
        const listingsResponse = await fetch('/api/listings?pageSize=100');
        if (!listingsResponse.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const listingsData = await listingsResponse.json();
        
        // Create a map of platforms to update listings count
        const platformCounts = new Map<string, number>();
        
        // Process the listings
        const listingsWithSyncStatus = listingsData.data.map((listing: any) => {
          // Update platform count
          const siteId = listing.site_id;
          platformCounts.set(
            siteId, 
            (platformCounts.get(siteId) || 0) + 1
          );
          
          // Create listing item with platforms and sync status
          const listingItem: ListingItem = {
            id: listing.id,
            title: listing.title,
            platforms: [siteId],
            status: {}
          };
          
          // Set status for all platforms
          platformsData.forEach((platform: Platform) => {
            if (platform.id === siteId) {
              listingItem.status[platform.id] = 'synced';
            } else if (platform.connected) {
              listingItem.status[platform.id] = 'not-synced';
            } else {
              listingItem.status[platform.id] = 'not-connected';
            }
          });
          
          return listingItem;
        });
        
        // Update platform counts
        const updatedPlatforms = platformsData.map((platform: Platform) => ({
          ...platform,
          listingsCount: platformCounts.get(platform.id) || 0
        }));
        
        setPlatforms(updatedPlatforms);
        setListings(listingsWithSyncStatus);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggleSelectAllListings = () => {
    if (selectedListings.length === listings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(listings.map(listing => listing.id));
    }
  };
  
  const handleToggleSelectListing = (id: string) => {
    setSelectedListings(prev => {
      if (prev.includes(id)) {
        return prev.filter(listingId => listingId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleToggleSelectAllPlatforms = () => {
    if (selectedPlatforms.length === platforms.filter(p => p.connected).length) {
      setSelectedPlatforms([]);
    } else {
      setSelectedPlatforms(platforms.filter(p => p.connected).map(p => p.id));
    }
  };
  
  const handleToggleSelectPlatform = (id: PlatformId) => {
    setSelectedPlatforms(prev => {
      if (prev.includes(id)) {
        return prev.filter(platformId => platformId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSyncPlatform = async (platformId: string) => {
    setIsSyncing(true);
    setPlatforms(prev => 
      prev.map(platform => 
        platform.id === platformId 
          ? { ...platform, syncing: true } 
          : platform
      )
    );
    
    try {
      const response = await fetch('/api/listings/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ siteId: platformId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync platform');
      }
      
      const data = await response.json();
      
      // Add this platform's results to syncResults
      setSyncResults(prev => [
        ...prev,
        {
          site_id: platformId,
          site_name: platforms.find(p => p.id === platformId)?.name || 'Unknown',
          success: data.success,
          listings_added: data.results?.find((r: any) => r.site_id === platformId)?.listings_added || 0,
          message: data.results?.find((r: any) => r.site_id === platformId)?.message,
          error: data.results?.find((r: any) => r.site_id === platformId)?.error,
          listings: data.results?.find((r: any) => r.site_id === platformId)?.listings
        }
      ]);
      
      setHasSynced(true);
      
      // Update platform's last sync time
      setPlatforms(prev => 
        prev.map(platform => 
          platform.id === platformId 
            ? { 
                ...platform, 
                lastSync: new Date().toISOString(),
                listingsCount: platform.listingsCount + (data.results?.find((r: any) => r.site_id === platformId)?.listings_added || 0)
              } 
            : platform
        )
      );
      
      // Refresh listings if new ones were added
      if (data.total_new_listings > 0) {
        fetchListings();
      }
    } catch (error) {
      console.error(`Error syncing platform ${platformId}:`, error);
      setSyncResults(prev => [
        ...prev,
        {
          site_id: platformId,
          site_name: platforms.find(p => p.id === platformId)?.name || 'Unknown',
          success: false,
          listings_added: 0,
          error: error instanceof Error ? error.message : 'An unknown error occurred'
        }
      ]);
    } finally {
      setPlatforms(prev => 
        prev.map(platform => 
          platform.id === platformId 
            ? { ...platform, syncing: false } 
            : platform
        )
      );
      setIsSyncing(false);
    }
  };
  
  const handleSyncSelectedPlatforms = async () => {
    if (selectedPlatforms.length === 0) return;
    
    setIsSyncing(true);
    
    // Create a copy of selected platforms to iterate through
    const platformsToSync = [...selectedPlatforms];
    
    // Clear previous sync results
    setSyncResults([]);
    
    // Sync each platform sequentially
    for (const platformId of platformsToSync) {
      await handleSyncPlatform(platformId);
    }
    
    setIsSyncing(false);
  };
  
  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings?pageSize=100');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      
      // Process the listings
      const listingsWithSyncStatus = data.data.map((listing: any) => {
        // Create listing item with platforms and sync status
        const listingItem: ListingItem = {
          id: listing.id,
          title: listing.title,
          platforms: [listing.site_id],
          status: {}
        };
        
        // Set status for all platforms
        platforms.forEach(platform => {
          if (platform.id === listing.site_id) {
            listingItem.status[platform.id] = 'synced';
          } else if (platform.connected) {
            listingItem.status[platform.id] = 'not-synced';
          } else {
            listingItem.status[platform.id] = 'not-connected';
          }
        });
        
        return listingItem;
      });
      
      setListings(listingsWithSyncStatus);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };
  
  // Filter listings by search term
  const filteredListings = listings.filter(listing => 
    listing.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group platforms by connection status for better display
  const connectedPlatforms = platforms.filter(platform => platform.connected);
  const disconnectedPlatforms = platforms.filter(platform => !platform.connected);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link 
          href="/listings" 
          className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Listings
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sync Listings</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : hasSynced ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Results</CardTitle>
              <CardDescription>
                Results from your recent sync operation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.site_name}</h3>
                      <Badge variant={result.success ? 'success' : 'danger'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    
                    {result.success ? (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {result.listings_added > 0 
                            ? `Added ${result.listings_added} new listings` 
                            : result.message || 'No new listings found'}
                        </p>
                        
                        {result.listings && result.listings.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium mb-1">New Listings:</p>
                            <ul className="text-sm space-y-1">
                              {result.listings.map(listing => (
                                <li key={listing.id} className="flex items-center">
                                  <span 
                                    className={`w-2 h-2 rounded-full mr-2 ${
                                      listing.status === 'active' 
                                        ? 'bg-green-500' 
                                        : 'bg-yellow-500'
                                    }`}
                                  ></span>
                                  <Link 
                                    href={`/listings/${listing.id}`}
                                    className="hover:underline"
                                  >
                                    {listing.title}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-red-500">
                        Error: {result.error || 'Unknown error occurred'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setHasSynced(false)}
                >
                  Back to Sync Options
                </Button>
                <Link href="/listings">
                  <Button>
                    Go to Listings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Connected Platforms */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Platforms</CardTitle>
              <CardDescription>
                Select the platforms you want to sync listings from
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectedPlatforms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    You don't have any connected platforms yet.
                  </p>
                  <Link href="/sites/connect">
                    <Button>
                      Connect a Platform
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="select-all-platforms"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedPlatforms.length === connectedPlatforms.length && connectedPlatforms.length > 0}
                        onChange={handleToggleSelectAllPlatforms}
                      />
                      <label htmlFor="select-all-platforms" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select All
                      </label>
                    </div>
                    
                    <Button
                      onClick={handleSyncSelectedPlatforms}
                      disabled={selectedPlatforms.length === 0 || isSyncing}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Selected {selectedPlatforms.length > 0 && `(${selectedPlatforms.length})`}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {connectedPlatforms.map(platform => (
                      <div 
                        key={platform.id}
                        className={`border rounded-lg overflow-hidden ${
                          selectedPlatforms.includes(platform.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-center mb-4">
                            <input
                              type="checkbox"
                              id={`platform-${platform.id}`}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedPlatforms.includes(platform.id)}
                              onChange={() => handleToggleSelectPlatform(platform.id)}
                            />
                            <label htmlFor={`platform-${platform.id}`} className="ml-2 flex-1">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-2">
                                  {platform.logo ? (
                                    <img
                                      src={platform.logo}
                                      alt={platform.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs font-bold">
                                      {platform.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <span className="font-medium">{platform.name}</span>
                              </div>
                            </label>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-2"
                              onClick={() => handleSyncPlatform(platform.id)}
                              disabled={isSyncing}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Last Sync:</p>
                              <p>{formatDate(platform.lastSync)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-500 dark:text-gray-400">Listings:</p>
                              <p>{platform.listingsCount}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Disconnected Platforms */}
          {disconnectedPlatforms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Platforms</CardTitle>
                <CardDescription>
                  Connect more platforms to sync listings from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {disconnectedPlatforms.map(platform => (
                    <div 
                      key={platform.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-2">
                              {platform.logo ? (
                                <img
                                  src={platform.logo}
                                  alt={platform.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-xs font-bold">
                                  {platform.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <span className="font-medium">{platform.name}</span>
                          </div>
                          <Badge variant="default">Not Connected</Badge>
                        </div>
                        
                        <div className="mt-2 flex justify-end">
                          <Link href={`/sites/connect?platform=${platform.id}`}>
                            <Button size="sm">
                              Connect
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Listings to Sync */}
          {listings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Your Listings</CardTitle>
                <CardDescription>
                  View the sync status of your listings across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search listings..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={selectedListings.length === filteredListings.length && filteredListings.length > 0}
                              onChange={handleToggleSelectAllListings}
                            />
                            <span className="ml-2">Listing</span>
                          </div>
                        </th>
                        {connectedPlatforms.map(platform => (
                          <th key={platform.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {platform.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredListings.length === 0 ? (
                        <tr>
                          <td 
                            colSpan={connectedPlatforms.length + 1} 
                            className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                          >
                            {searchTerm 
                              ? `No listings matching "${searchTerm}"` 
                              : 'No listings found'}
                          </td>
                        </tr>
                      ) : (
                        filteredListings.map(listing => (
                          <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={selectedListings.includes(listing.id)}
                                  onChange={() => handleToggleSelectListing(listing.id)}
                                />
                                <div className="ml-4">
                                  <Link 
                                    href={`/listings/${listing.id}`}
                                    className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                                  >
                                    {listing.title}
                                  </Link>
                                </div>
                              </div>
                            </td>
                            {connectedPlatforms.map(platform => {
                              const status = listing.status[platform.id] || 'not-connected';
                              const StatusIcon = statusBadge[status]?.icon || AlertTriangle;
                              return (
                                <td key={platform.id} className="px-4 py-4 whitespace-nowrap text-center">
                                  <Badge variant={statusBadge[status]?.variant || 'default'}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusBadge[status]?.label || status}
                                  </Badge>
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 