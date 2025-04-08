'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ListPlus, 
  RefreshCw, 
  LinkIcon, 
  Settings, 
  CreditCard, 
  HelpCircle 
} from 'lucide-react';

interface QuickActionProps {
  isPro: boolean;
}

export function QuickActions({ isPro }: QuickActionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href="/listings/create" className="block w-full">
          <Button className="w-full justify-between group" leftIcon={<ListPlus className="h-4 w-4 transition-transform group-hover:scale-110" />}>
            <span>Create New Listing</span>
          </Button>
        </Link>
        
        <Link href="/listings/sync" className="block w-full">
          <Button 
            variant="outline" 
            className="w-full justify-between group" 
            leftIcon={<RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-45" />}
          >
            <span>Sync Listings</span>
          </Button>
        </Link>
        
        <Link href="/sites" className="block w-full">
          <Button 
            variant="outline" 
            className="w-full justify-between"
            leftIcon={<LinkIcon className="h-4 w-4" />}
          >
            <span>Manage Platforms</span>
          </Button>
        </Link>
        
        <Link href="/settings" className="block w-full">
          <Button 
            variant="outline" 
            className="w-full justify-between"
            leftIcon={<Settings className="h-4 w-4" />}
          >
            <span>Settings</span>
          </Button>
        </Link>
        
        {!isPro && (
          <Link href="/subscription" className="block w-full">
            <Button 
              variant="outline" 
              className="w-full justify-between bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 border-transparent"
              leftIcon={<CreditCard className="h-4 w-4" />}
            >
              <span>Upgrade to Pro</span>
            </Button>
          </Link>
        )}
        
        <Link href="/docs" className="block w-full">
          <Button 
            variant="ghost" 
            className="w-full justify-between text-gray-600 dark:text-gray-400"
            leftIcon={<HelpCircle className="h-4 w-4" />}
          >
            <span>Help & Resources</span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 