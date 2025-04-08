// Navigation menu items
export const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    name: 'Listings',
    href: '/listings',
    icon: 'ListChecks',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: 'BarChart',
  },
  {
    name: 'Sync',
    href: '/sync',
    icon: 'RefreshCw',
  },
  {
    name: 'Extension',
    href: '/extension',
    icon: 'Chrome',
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: 'Settings',
  },
];

// Supported marketplace platforms
export const MARKETPLACE_PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook Marketplace',
    icon: 'facebook',
    description: 'Connect your Facebook Marketplace account to sync listings',
    enabled: true,
  },
  {
    id: 'ebay',
    name: 'eBay',
    icon: 'ebay',
    description: 'Connect your eBay seller account to sync listings',
    enabled: true,
  },
  {
    id: 'etsy',
    name: 'Etsy',
    icon: 'etsy',
    description: 'Connect your Etsy shop to sync listings',
    enabled: true,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    icon: 'amazon',
    description: 'Connect your Amazon seller account to sync listings',
    enabled: false,
    comingSoon: true,
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: 'shopify',
    description: 'Connect your Shopify store to sync products',
    enabled: false,
    comingSoon: true,
  },
];

// Listing status options
export const LISTING_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  PAUSED: 'paused',
  SOLD: 'sold',
  DELETED: 'deleted',
};

// Subscription plan details
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    interval: 'month',
    listingLimit: 25,
    features: [
      'Up to 25 listings',
      'Basic analytics',
      'Manual sync',
      'Connect up to 2 sites',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited listings',
      'Advanced analytics',
      'Automatic sync',
      'Priority support',
      'Bulk listing tools',
      'Custom listing templates',
      'Connect unlimited sites',
    ],
  },
};

export const APP_NAME = 'Listing Aggregator';

export const MAX_FREE_SITES = 3;

export const SITE_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
};

export const LISTING_STATUSES = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  SOLD: 'sold'
}; 