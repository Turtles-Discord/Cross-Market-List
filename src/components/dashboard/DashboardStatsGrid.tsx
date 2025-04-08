'use client';

import React from 'react';
import { 
  ListChecks, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle2, 
  Link as LinkIcon, 
  TrendingUp 
} from 'lucide-react';
import { DashboardCard } from './DashboardCard';

type ChangeType = 'increase' | 'decrease' | 'neutral';

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  connectedSitesCount: number;
  recentListings: number;
  listingGrowth: {
    percentage: number;
    trend: ChangeType;
  };
}

interface DashboardStatsGridProps {
  stats: DashboardStats;
  className?: string;
  isLoading?: boolean;
}

export function DashboardStatsGrid({ 
  stats, 
  className = '',
  isLoading = false
}: DashboardStatsGridProps) {
  const {
    totalListings,
    activeListings,
    pendingListings,
    soldListings,
    connectedSitesCount,
    recentListings,
    listingGrowth
  } = stats;

  // Format the listing growth for display
  const formattedGrowth = `${listingGrowth.percentage > 0 ? '+' : ''}${listingGrowth.percentage}%`;

  const statsItems = [
    {
      title: 'Total Listings',
      value: totalListings,
      icon: ListChecks,
      change: formattedGrowth,
      changeType: listingGrowth.trend,
      iconColor: 'text-blue-500',
      iconBackgroundColor: 'bg-blue-500 bg-opacity-10',
    },
    {
      title: 'Active Listings',
      value: activeListings,
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      iconBackgroundColor: 'bg-green-500 bg-opacity-10',
    },
    {
      title: 'Pending Listings',
      value: pendingListings,
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      iconBackgroundColor: 'bg-amber-500 bg-opacity-10',
    },
    {
      title: 'Sold Listings',
      value: soldListings,
      icon: ShoppingBag,
      iconColor: 'text-purple-500',
      iconBackgroundColor: 'bg-purple-500 bg-opacity-10',
    },
    {
      title: 'Connected Sites',
      value: connectedSitesCount,
      icon: LinkIcon,
      iconColor: 'text-indigo-500',
      iconBackgroundColor: 'bg-indigo-500 bg-opacity-10',
    },
    {
      title: 'Recent Activity',
      value: recentListings,
      suffix: 'last 7 days',
      icon: TrendingUp,
      iconColor: 'text-cyan-500',
      iconBackgroundColor: 'bg-cyan-500 bg-opacity-10',
    },
  ];

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center">
              <div className="rounded-md bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
              <div className="ml-5 w-full">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {statsItems.map((item) => (
        <DashboardCard 
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          change={item.change}
          changeType={item.changeType as ChangeType}
          iconColor={item.iconColor}
          iconBackgroundColor={item.iconBackgroundColor}
          suffix={item.suffix}
        />
      ))}
    </div>
  );
} 