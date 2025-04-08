"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Trash,
  Edit,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { 
  Button, 
  Input, 
  Card, 
  Badge, 
  Select,
  Loading,
  Pagination
} from '@/components/ui';

// Interface for listing
interface Listing {
  id: string;
  title: string;
  price: number;
  currency: string;
  status: 'active' | 'draft' | 'sold' | 'pending';
  created_at: string;
  updated_at: string;
  published_at: string | null;
  url: string | null;
  site: {
    id: string;
    name: string;
    logo_url: string;
  };
}

// Interface for API response
interface ListingsResponse {
  data: Listing[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Status options for filter
const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'sold', label: 'Sold' },
  { value: 'pending', label: 'Pending' },
];

export default function ListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get query parameters
  const currentPage = Number(searchParams.get('page') || '1');
  const currentPageSize = Number(searchParams.get('pageSize') || '10');
  const currentSearch = searchParams.get('search') || '';
  const currentStatus = searchParams.get('status') || '';
  const currentPlatform = searchParams.get('platform') || '';
  const currentSortBy = searchParams.get('sortBy') || 'created_at';
  const currentSortOrder = searchParams.get('sortOrder') || 'desc';

  // State variables
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [status, setStatus] = useState(currentStatus);
  const [platforms, setPlatforms] = useState<{id: string, name: string}[]>([]);
  const [platformId, setPlatformId] = useState(currentPlatform);
  const [sortBy, setSortBy] = useState(currentSortBy);
  const [sortOrder, setSortOrder] = useState(currentSortOrder);
  
  // Load connected platforms for filter
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const response = await fetch('/api/sites/connected');
        if (!response.ok) {
          throw new Error('Failed to fetch connected platforms');
        }
        const data = await response.json();
        // Extract platform info from the connected sites
        const platformList = data.map((item: any) => ({
          id: item.site_id,
          name: item.site.name,
        }));
        setPlatforms(platformList);
      } catch (error) {
        console.error('Error fetching platforms:', error);
      }
    };
    
    fetchPlatforms();
  }, []);
  
  // Function to fetch listings with current filters
  const fetchListings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('pageSize', currentPageSize.toString());
      
      if (currentSearch) params.append('search', currentSearch);
      if (currentStatus) params.append('status', currentStatus);
      if (currentPlatform) params.append('platform', currentPlatform);
      params.append('sortBy', currentSortBy);
      params.append('sortOrder', currentSortOrder);
      
      // Fetch listings from API
      const response = await fetch(`/api/listings?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data: ListingsResponse = await response.json();
      
      setListings(data.data);
      setTotalCount(data.pagination.totalCount);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching listings:', error);
      setError(error.message || 'An error occurred while fetching listings');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch listings when filters change
  useEffect(() => {
    fetchListings();
  }, [
    currentPage, 
    currentPageSize, 
    currentSearch, 
    currentStatus, 
    currentPlatform, 
    currentSortBy, 
    currentSortOrder
  ]);
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    params.append('page', '1'); // Reset to first page when filters change
    
    if (searchTerm) params.append('search', searchTerm);
    if (status) params.append('status', status);
    if (platformId) params.append('platform', platformId);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    
    router.push(`/listings?${params.toString()}`);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/listings?${params.toString()}`);
  };
  
  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'draft':
        return <Badge variant="warning">Draft</Badge>;
      case 'sold':
        return <Badge variant="primary">Sold</Badge>;
      case 'pending':
        return <Badge variant="info">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Toggle sort order
  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc'); // Default to descending order
    }
  };
  
  // Apply sort
  const applySort = (column: string) => {
    const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', column);
    params.set('sortOrder', newOrder);
    router.push(`/listings?${params.toString()}`);
  };
  
  // Handle listing deletion
  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }
      
      // Refetch listings after deletion
      fetchListings();
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      alert(error.message || 'An error occurred while deleting the listing');
    }
  };
  
  // Convert platform data to options format
  const platformOptions = [
    { value: '', label: 'All Platforms' },
    ...platforms.map(platform => ({
      value: platform.id,
      label: platform.name
    }))
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Listings
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => fetchListings()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Link href="/listings/sync">
            <Button variant="outline">
              Sync Listings
            </Button>
          </Link>
          <Link href="/listings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Listing
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Search and filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search listings..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                />
              </div>
            </div>
            
            <div>
              <Select
                options={STATUS_OPTIONS}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
            
            <div>
              <Select
                options={platformOptions}
                value={platformId}
                onChange={(e) => setPlatformId(e.target.value)}
              />
            </div>
            
            <div>
              <Button
                variant="outline"
                className="w-full"
                onClick={applyFilters}
                disabled={isLoading}
              >
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => fetchListings()}
          >
            Retry
          </Button>
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center my-8">
          <h3 className="text-lg font-medium mb-2">No listings found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || status || platformId
              ? 'Try changing your filters or create a new listing.'
              : 'Create your first listing or sync existing listings from your connected platforms.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/listings/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Listing
              </Button>
            </Link>
            <Link href="/listings/sync">
              <Button variant="outline">
                Sync Listings
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Showing {listings.length} of {totalCount} listings
          </div>
          
          {/* Listings table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => applySort('title')}
                    >
                      <div className="flex items-center">
                        Listing
                        {sortBy === 'title' && (
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => applySort('price')}
                    >
                      <div className="flex items-center">
                        Price
                        {sortBy === 'price' && (
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Platform
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => applySort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        {sortBy === 'status' && (
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => applySort('created_at')}
                    >
                      <div className="flex items-center">
                        Date
                        {sortBy === 'created_at' && (
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {listings.map((listing) => (
                    <tr 
                      key={listing.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div>
                            <Link
                              href={`/listings/${listing.id}`}
                              className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {listing.title}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-900 dark:text-white">
                        {formatPrice(listing.price, listing.currency)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-2">
                            {listing.site.logo_url ? (
                              <img
                                src={listing.site.logo_url}
                                alt={listing.site.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-bold">
                                {listing.site.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-600 dark:text-gray-300">
                            {listing.site.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(listing.status)}
                      </td>
                      <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                        {formatDate(listing.created_at)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end">
                          <div className="space-x-1">
                            <Link href={`/listings/${listing.id}`}>
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                            </Link>
                            <Link href={`/listings/${listing.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            {listing.url && (
                              <a
                                href={listing.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </a>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteListing(listing.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 