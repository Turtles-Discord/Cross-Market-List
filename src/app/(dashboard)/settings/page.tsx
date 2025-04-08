'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, Bell, CreditCard, Key, ExternalLink, Globe, Shield, 
  HelpCircle, Settings, Smartphone, Mail, Bookmark, LogOut 
} from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

// Define types for settings items
interface SettingItem {
  name: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
  badge?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

// Define settings sections and links
const SETTINGS_SECTIONS: SettingSection[] = [
  {
    title: 'Account',
    items: [
      { 
        name: 'Profile Information', 
        description: 'Update your account details and profile picture', 
        href: '/settings/profile',
        icon: User 
      },
      { 
        name: 'Password & Security', 
        description: 'Manage your password and security preferences', 
        href: '/settings/security',
        icon: Key 
      },
      { 
        name: 'Notifications', 
        description: 'Configure how and when you want to be notified', 
        href: '/settings/notifications',
        icon: Bell 
      },
      { 
        name: 'Billing & Subscription', 
        description: 'Manage your subscription plan and payment methods', 
        href: '/subscription',
        icon: CreditCard 
      }
    ]
  },
  {
    title: 'Connections',
    items: [
      { 
        name: 'Platform Connections',
        description: 'Manage connections to marketplace platforms', 
        href: '/settings/connections',
        icon: Globe
      },
      { 
        name: 'Mobile App',
        description: 'Download our mobile app and connect your devices', 
        href: '/settings/mobile',
        icon: Smartphone,
        badge: 'New'
      }
    ]
  },
  {
    title: 'Preferences',
    items: [
      { 
        name: 'Application Settings',
        description: 'Customize application appearance and behavior', 
        href: '/settings/preferences',
        icon: Settings
      },
      { 
        name: 'Saved Preferences',
        description: 'Manage your saved searches and preferences', 
        href: '/settings/saved',
        icon: Bookmark
      }
    ]
  },
  {
    title: 'Support',
    items: [
      { 
        name: 'Help Center',
        description: 'Get help and find answers to your questions', 
        href: 'https://help.example.com',
        icon: HelpCircle,
        external: true
      },
      { 
        name: 'Privacy & Data',
        description: 'Manage your data and privacy settings', 
        href: '/settings/privacy',
        icon: Shield
      },
      { 
        name: 'Contact Support',
        description: 'Reach out to our support team for assistance', 
        href: '/support',
        icon: Mail
      }
    ]
  }
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  
  // This would handle the logout in a real app
  const handleLogout = () => {
    setIsLoading(true);
    
    // Simulate an API call
    setTimeout(() => {
      window.location.href = '/'; // Redirect to home page
    }, 1500);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* User Profile Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-2xl font-bold">
                    JS
                  </div>
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full">
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">John Smith</h2>
                    <p className="text-gray-500 dark:text-gray-400">john.smith@example.com</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      Professional Plan
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                      Verified Account
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                      25 Listings
                    </span>
                  </div>
                </div>
                
                <div>
                  <Link href="/settings/profile">
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Setting Sections */}
          {SETTINGS_SECTIONS.map((section, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
                {section.title}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <item.icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {item.name}
                          </h3>
                          
                          {item.external && (
                            <ExternalLink className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          )}
                          
                          {item.badge && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="toggle-email" 
                    className="sr-only toggle-checkbox" 
                    defaultChecked 
                  />
                  <label 
                    htmlFor="toggle-email" 
                    className="block h-6 w-10 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
                  ></label>
                  <span className="absolute left-0 top-0 mt-1 ml-1 bg-white dark:bg-gray-800 w-4 h-4 rounded-full transition-transform duration-200 ease-in-out toggle-dot"></span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Push Notifications</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="toggle-push" 
                    className="sr-only toggle-checkbox" 
                    defaultChecked 
                  />
                  <label 
                    htmlFor="toggle-push" 
                    className="block h-6 w-10 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
                  ></label>
                  <span className="absolute left-0 top-0 mt-1 ml-1 bg-white dark:bg-gray-800 w-4 h-4 rounded-full transition-transform duration-200 ease-in-out toggle-dot"></span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="toggle-dark" 
                    className="sr-only toggle-checkbox" 
                  />
                  <label 
                    htmlFor="toggle-dark" 
                    className="block h-6 w-10 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer"
                  ></label>
                  <span className="absolute left-0 top-0 mt-1 ml-1 bg-white dark:bg-gray-800 w-4 h-4 rounded-full transition-transform duration-200 ease-in-out toggle-dot"></span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" size="sm">Save Preferences</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">Account active</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">Email verified</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-gray-700 dark:text-gray-300">3 platforms connected</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last login: Today at 10:23 AM
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Actions here can't be undone. Please proceed with caution.
              </p>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal"
                >
                  <span>Download my data</span>
                  <HelpCircle className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-between text-left font-normal"
                >
                  <span>Delete my account</span>
                  <Shield className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="danger" 
                  className="w-full justify-center mt-4"
                  isLoading={isLoading}
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 