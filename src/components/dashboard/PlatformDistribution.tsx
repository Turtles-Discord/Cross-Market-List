'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface PlatformData {
  platform_id: string;
  platform_name: string;
  count: number;
}

interface PlatformDistributionProps {
  platforms: PlatformData[];
  isLoading?: boolean;
}

export function PlatformDistribution({ platforms, isLoading = false }: PlatformDistributionProps) {
  const platformColors: Record<string, string> = {
    facebook: '#4267B2',
    ebay: '#e53238',
    etsy: '#F45800',
    poshmark: '#CF0854',
    mercari: '#D4FF00',
    craigslist: '#5F4C37',
    offerup: '#088142',
    shopify: '#7AB55C',
    amazon: '#FF9900',
    default: '#718096',
  };

  // Calculate the total listings to determine percentages
  const totalListings = platforms.reduce((sum, platform) => sum + platform.count, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 mr-3"></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (platforms.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400">No platform data available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.map((platform) => {
            const percentage = totalListings > 0 
              ? Math.round((platform.count / totalListings) * 100) 
              : 0;
            
            const color = platformColors[platform.platform_id] || platformColors.default;
            
            return (
              <div key={platform.platform_id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {platform.platform_name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {platform.count} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: color 
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 