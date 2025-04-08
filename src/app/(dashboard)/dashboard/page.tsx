'use client';

import React, { useState, useEffect } from 'react';
import { DashboardStatsGrid } from '@/components/dashboard/DashboardStatsGrid';
import { RecentListings } from '@/components/dashboard/RecentListings';
import { PlatformDistribution } from '@/components/dashboard/PlatformDistribution';
import { QuickActions } from '@/components/dashboard/QuickActions';
import SubscriptionUsage from '@/components/dashboard/SubscriptionUsage';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoadingDashboard(true);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch recent listings
  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        setIsLoadingListings(true);
        const response = await fetch('/api/dashboard/recent-listings');
        
        if (!response.ok) {
          throw new Error('Failed to fetch recent listings');
        }
        
        const data = await response.json();
        setRecentListings(data.recentListings || []);
      } catch (err) {
        console.error('Error fetching recent listings:', err);
      } finally {
        setIsLoadingListings(false);
      }
    };

    fetchRecentListings();
  }, []);

  // Default values for when data is still loading
  const defaultStats = {
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    soldListings: 0,
    connectedSitesCount: 0,
    recentListings: 0,
    listingGrowth: {
      percentage: 0,
      trend: 'neutral' as const
    }
  };

  // Extract data for components when available
  const stats = dashboardData?.stats || defaultStats;
  const platforms = dashboardData?.platforms || [];
  const isPro = dashboardData?.user?.isPro || false;

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your marketplace listings and activity
        </p>
      </div>

      {/* Stats Grid */}
      <DashboardStatsGrid 
        stats={stats} 
        isLoading={isLoadingDashboard} 
        className="mb-8" 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2">
          <RecentListings 
            listings={recentListings} 
            isLoading={isLoadingListings} 
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription card */}
          <SubscriptionUsage />

          {/* Platform distribution */}
          <PlatformDistribution 
            platforms={platforms} 
            isLoading={isLoadingDashboard} 
          />

          {/* Quick actions */}
          <QuickActions isPro={isPro} />
        </div>
      </div>
    </div>
  );
} 