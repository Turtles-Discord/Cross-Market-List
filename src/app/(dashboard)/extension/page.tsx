'use client';

import React from 'react';
import { ArrowDownTrayIcon, LockClosedIcon, LinkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

const EXTENSION_DOWNLOAD_URL = '/extension/CrossMarketList.zip';

export default function ExtensionPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Chrome Extension</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mb-6">
          Install our Chrome Extension to automatically detect and connect to your marketplace accounts.
        </p>
        <Button 
          onClick={() => window.open(EXTENSION_DOWNLOAD_URL, '_blank')}
          size="lg"
          className="flex items-center"
        >
          <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
          Download Extension
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowDownTrayIcon className="w-5 h-5 mr-2 text-blue-600" />
              Step 1: Install
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Download the extension using the button above</li>
              <li>Unzip the downloaded file</li>
              <li>Open Chrome and go to <code>chrome://extensions</code></li>
              <li>Enable "Developer Mode" (top right toggle)</li>
              <li>Click "Load unpacked" and select the unzipped folder</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="w-5 h-5 mr-2 text-blue-600" />
              Step 2: Connect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-3">
              <li>Click the extension icon in Chrome's toolbar</li>
              <li>Sign in with your CrossMarketList account</li>
              <li>Visit your marketplace sites (Facebook Marketplace, eBay, Etsy)</li>
              <li>The extension will automatically detect these sites</li>
              <li>Log in to each marketplace to connect them</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ArrowPathIcon className="w-5 h-5 mr-2 text-blue-600" />
              Step 3: Sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal pl-5 space-y-3">
              <li>After connecting sites, your listings will begin to sync</li>
              <li>You can trigger manual syncs from the extension popup</li>
              <li>Pro accounts get automatic daily syncing</li>
              <li>View all listings in your CrossMarketList dashboard</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold">Is my data secure?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your security is our priority. The extension only captures session tokens (never passwords) 
              and all communication with our servers is encrypted. We only request permissions for specific
              marketplace websites.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold">Which marketplaces are supported?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              We currently support Facebook Marketplace, eBay, and Etsy. More platforms will be added soon.
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold">How do I update the extension?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Until we're in the Chrome Web Store, you'll need to manually download and install updates. 
              We'll notify you when updates are available.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <Alert variant="info">
          <h3 className="font-bold">Developer Preview</h3>
          <p>
            This extension is currently in developer preview. Please report any issues or feedback to our 
            support team at support@crossmarketlist.com
          </p>
        </Alert>
      </div>
    </div>
  );
} 