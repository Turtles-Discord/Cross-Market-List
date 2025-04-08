'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm, ListingFormData } from '@/components/listings';
import { MARKETPLACE_PLATFORMS } from '@/lib/constants';

export default function NewListingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ListingFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert platforms to site_id
      const selectedPlatform = MARKETPLACE_PLATFORMS.find(
        p => p.enabled && p.name === data.platforms[0]
      );
      
      if (!selectedPlatform) {
        throw new Error('Selected platform is not supported');
      }
      
      // Prepare API request data
      const requestData = {
        site_id: selectedPlatform.id,
        title: data.title,
        description: data.description,
        price: data.price,
        currency: 'USD', // Default currency
        status: 'draft', // Start as draft
        metadata: {
          category: data.category,
          condition: data.condition,
          images: data.images,
        }
      };
      
      // Call the API
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating listing');
      }
      
      // Redirect to listings page on success
      router.push('/listings');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/listings');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Listing</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Fill out the form below to create a new listing across platforms
        </p>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <ListingForm 
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
} 