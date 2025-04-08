'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui';

interface SiteConnectLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  backUrl?: string;
  backText?: string;
  error?: string;
  success?: string;
  actions?: React.ReactNode;
}

export default function SiteConnectLayout({
  children,
  title,
  description,
  backUrl = '/sites',
  backText = 'Back to Sites',
  error,
  success,
  actions
}: SiteConnectLayoutProps) {
  const router = useRouter();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href={backUrl} className="inline-flex items-center text-blue-600 hover:text-blue-500">
          <ArrowLeft className="h-4 w-4 mr-1" />
          {backText}
        </Link>
      </div>
      
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
          <div className="flex">
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="mb-6">
        {children}
      </div>
      
      {/* Actions */}
      {actions && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end space-x-3">
            {actions}
          </div>
        </div>
      )}
    </div>
  );
} 