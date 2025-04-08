'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Badge, Loading } from '@/components/ui';
import { ArrowLeft, Edit, Trash, Share, Eye, DollarSign, Calendar, Tag, CheckCircle, ExternalLink } from 'lucide-react';
import { LISTING_STATUSES } from "@/lib/constants";

// Interface for the listing data
interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  external_id?: string;
  url?: string;
  metadata?: {
    category?: string;
    condition?: string;
    views?: number;
    engagement?: number;
    images?: string[];
    [key: string]: any;
  };
  sites: {
    id: string;
    name: string;
    url: string;
    logo_url: string;
  };
}

// Statistics for listing performance
const getListingStats = (listing: Listing) => [
  { 
    label: 'Views', 
    value: listing.metadata?.views || 0, 
    icon: Eye, 
    change: 0, 
    changeType: 'neutral' 
  },
  { 
    label: 'Engagement', 
    value: listing.metadata?.engagement || 0, 
    icon: CheckCircle, 
    change: 0, 
    changeType: 'neutral' 
  },
  { 
    label: 'Click Rate', 
    value: listing.metadata?.views ? 
      `${((listing.metadata?.engagement || 0) / listing.metadata.views * 100).toFixed(1)}%` : 
      '0%', 
    icon: Share, 
    change: 0, 
    changeType: 'neutral' 
  },
];

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Listing not found');
          }
          throw new Error('Failed to fetch listing');
        }
        
        const data = await response.json();
        setListing(data);
        
        if (data) {
          setStats(getListingStats(data));
        }
      } catch (error: any) {
        console.error('Error fetching listing:', error);
        setError(error.message || 'An error occurred while fetching the listing');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const response = await fetch(`/api/listings/${params.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete listing');
        }
        
        router.push('/listings');
      } catch (error: any) {
        console.error('Error deleting listing:', error);
        alert(error.message || 'Failed to delete the listing. Please try again.');
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'primary' | 'info' | 'default' => {
    switch (status.toLowerCase()) {
      case LISTING_STATUSES.ACTIVE: return 'success';
      case LISTING_STATUSES.DRAFT: return 'warning';
      case LISTING_STATUSES.ARCHIVED: return 'primary';
      case LISTING_STATUSES.SOLD: return 'info';
      default: return 'default';
    }
  };

  // Format price with currency
  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: currency 
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/listings" className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Listings
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex justify-center">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/listings" className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Listings
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <h2 className="text-xl font-medium text-red-600 dark:text-red-400">
            {error || 'Listing Not Found'}
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            The listing you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push('/listings')}>
              Return to Listings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const images = listing.metadata?.images || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/listings" className="inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Listings
        </Link>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{listing.title}</h1>
          <div className="mt-2 flex items-center space-x-3">
            <Badge variant={getStatusVariant(listing.status)}>
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </Badge>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              <Calendar className="h-4 w-4 inline mr-1" /> Created {formatDate(listing.created_at)}
            </span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Link href={`/listings/${params.id}/edit`}>
            <Button variant="outline" className="flex items-center">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="danger" 
            className="flex items-center" 
            onClick={handleDelete} 
            isLoading={isDeleting}
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Images */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="relative aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-900">
              {images.length > 0 ? (
                <img 
                  src={images[activeImage]} 
                  alt={listing.title} 
                  className="object-contain w-full h-[400px]"
                />
              ) : (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-gray-500 dark:text-gray-400">No images available</p>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="p-4 flex items-center space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative h-16 w-16 rounded overflow-hidden ${activeImage === index ? 'ring-2 ring-blue-500' : 'opacity-70'}`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} className="object-cover h-full w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Listing Details</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                  <p className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">{listing.description || 'No description provided'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Price</h3>
                    <p className="mt-2 text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <DollarSign className="h-5 w-5 mr-1 text-green-600 dark:text-green-400" />
                      {formatPrice(listing.price, listing.currency)}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</h3>
                    <p className="mt-2 text-gray-900 dark:text-white flex items-center">
                      <Tag className="h-5 w-5 mr-2 text-blue-600" />
                      {listing.metadata?.category || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Condition</h3>
                    <p className="mt-2 text-gray-900 dark:text-white capitalize">
                      {listing.metadata?.condition || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                    <p className="mt-2 text-gray-900 dark:text-white">
                      {formatDate(listing.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Platform Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Platform</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <img 
                    src={listing.sites.logo_url || '/images/sites/generic.svg'} 
                    alt={listing.sites.name} 
                    className="h-10 w-10 rounded"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{listing.sites.name}</h3>
                  {listing.url && (
                    <a 
                      href={listing.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-1 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                    >
                      View on {listing.sites.name}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Performance</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                          {React.createElement(stat.icon, { className: "h-5 w-5" })}
                        </div>
                        <h3 className="ml-3 text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</h3>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 