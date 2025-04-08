'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/Button';
import { CreditCard, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';

interface PlatformUsage {
  platform_id: string;
  platform_name: string;
  count: number;
}

interface SubscriptionData {
  isPro: boolean;
  planType: string;
  totalListings: number;
  listingLimit: number | null;
  remainingListings: number | null;
  listingsByPlatform: PlatformUsage[];
  subscriptionStatus: string;
  periodStart: string | null;
  periodEnd: string | null;
  daysRemaining: number | null;
  plan: string;
  usage: number;
  limit: number | string;
  percentage: number;
}

export default function SubscriptionUsage() {
  const [usageData, setUsageData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/subscriptions/usage');
        
        if (!response.ok) {
          throw new Error('Failed to load subscription data');
        }
        
        const data = await response.json();
        setUsageData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching subscription usage:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsageData();
  }, []);

  // Calculate progress percentage for listings usage
  const calculateProgress = () => {
    if (!usageData) return 0;
    if (usageData.isPro) return 100; // Pro users always show full progress
    
    const { totalListings, listingLimit } = usageData;
    if (!listingLimit) return 0;
    
    const percentage = (totalListings / listingLimit) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-300 dark:border-red-700">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600 dark:text-red-400">
            <AlertCircle className="mr-2 h-5 w-5" />
            Error Loading Subscription Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error}. Please try again later or contact support.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!usageData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5 text-blue-500" />
          Subscription Status
          {usageData.isPro && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              Pro
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">
            Current Plan: <span className="font-bold">{usageData.isPro ? 'Pro' : 'Free'}</span>
            {usageData.subscriptionStatus === 'active' && (
              <CheckCircle2 className="ml-1 inline h-4 w-4 text-green-500" />
            )}
          </p>
          
          {usageData.periodEnd && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Calendar className="mr-1 h-3.5 w-3.5" />
              {usageData.isPro 
                ? `Renews on ${formatDate(usageData.periodEnd)}`
                : `Current period ends on ${formatDate(usageData.periodEnd)}`
              }
              {usageData.daysRemaining !== null && (
                <span className="ml-1">({usageData.daysRemaining} days remaining)</span>
              )}
            </p>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">
              Listings Usage
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {usageData.isPro 
                ? `${usageData.totalListings} listings (unlimited)`
                : `${usageData.totalListings} / ${usageData.listingLimit} listings`
              }
            </span>
          </div>
          <Progress value={calculateProgress()} className="h-2" />
          
          {!usageData.isPro && usageData.remainingListings !== null && usageData.remainingListings <= 5 && (
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              You have only {usageData.remainingListings} listing{usageData.remainingListings !== 1 ? 's' : ''} remaining on your Free plan.
            </p>
          )}
        </div>

        {usageData.listingsByPlatform && usageData.listingsByPlatform.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Listings by Platform</h4>
            <div className="space-y-2">
              {usageData.listingsByPlatform.map((platform) => (
                <div key={platform.platform_id} className="flex justify-between text-xs">
                  <span>{platform.platform_name}</span>
                  <span className="font-medium">{platform.count} listings</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {usageData.isPro ? (
          <Link href="/subscription">
            <Button variant="outline" size="sm">
              Manage Subscription
            </Button>
          </Link>
        ) : (
          <Link href="/subscription">
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Upgrade to Pro
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
} 