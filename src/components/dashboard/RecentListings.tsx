'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ListPlus } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  price?: number | null;
  currency?: string | null;
  status?: string | null;
  site?: {
    id: string;
    name: string;
  } | null;
  created_at: string;
  url?: string | null;
}

interface RecentListingsProps {
  listings: Listing[];
  isLoading?: boolean;
}

export function RecentListings({ listings, isLoading = false }: RecentListingsProps) {
  const formatPrice = (price?: number | null, currency?: string | null) => {
    if (price === undefined || price === null) return 'Price not set';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getStatusBadge = (status?: string | null) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'sold':
        return <Badge variant="primary">Sold</Badge>;
      case 'expired':
        return <Badge variant="danger">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div 
                key={index} 
                className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Listings</CardTitle>
        <Link href="/listings/create">
          <Button size="sm" leftIcon={<ListPlus className="h-4 w-4" />}>
            New Listing
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">You don't have any listings yet.</p>
            <Link href="/listings/create" className="mt-4 inline-block">
              <Button leftIcon={<ListPlus className="h-4 w-4" />}>
                Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div 
                key={listing.id} 
                className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
              >
                <div>
                  <Link href={`/listings/${listing.id}`}>
                    <div className="font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400">
                      {listing.title}
                    </div>
                  </Link>
                  <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                    <span>
                      {listing.site?.name || 'Unknown site'}
                    </span>
                    <span>•</span>
                    <span>{getRelativeTime(listing.created_at)}</span>
                    {listing.status && (
                      <>
                        <span>•</span>
                        <span>{getStatusBadge(listing.status)}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {formatPrice(listing.price, listing.currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 