'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm, ListingFormData } from '@/components/listings';
import { Button, Loading } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MARKETPLACE_PLATFORMS } from '@/lib/constants';

// Interface for API response format
interface ListingApiResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  site_id: string;
  external_id?: string;
  url?: string;
  metadata?: {
    category?: string;
    condition?: string;
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

// Transformed format for the form
interface FormListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  platforms: string[];
}

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [listing, setListing] = useState<FormListing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
        const apiListing: ListingApiResponse = await response.json();
        
        // Transform API response to form format
        const formListing: FormListing = {
          id: apiListing.id,
          title: apiListing.title,
          description: apiListing.description || '',
          price: apiListing.price,
          category: apiListing.metadata?.category || '',
          condition: apiListing.metadata?.condition || '',
          images: apiListing.metadata?.images || [],
          platforms: [apiListing.sites.name],
        };
        
        setListing(formListing);
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

  const handleSubmit = async (data: ListingFormData) => {
    setIsSaving(true);
    setError(null);
    
    try {
      // Find the site ID based on the platform name
      const selectedPlatform = MARKETPLACE_PLATFORMS.find(
        p => p.enabled && p.name === data.platforms[0]
      );
      
      if (!selectedPlatform) {
        throw new Error('Selected platform is not supported');
      }
      
      // Prepare API request data
      const requestData = {
        title: data.title,
        description: data.description,
        price: data.price,
        metadata: {
          category: data.category,
          condition: data.condition,
          images: data.images,
        }
      };
      
      // Call the API to update the listing
      const response = await fetch(`/api/listings/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error updating listing');
      }
      
      // Redirect to listing detail page on success
      router.push(`/listings/${params.id}`);
    } catch (error: any) {
      console.error('Error updating listing:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/listings/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/listings/${params.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Listing Details
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/listings/${params.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Listing Details
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Listing</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update the details for your listing
        </p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <ListingForm 
        isEditing={true}
        initialData={listing}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSaving}
      />
    </div>
  );
} 