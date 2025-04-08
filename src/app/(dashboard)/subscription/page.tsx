'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { 
  Check, 
  X, 
  CreditCard, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw,
  ShieldCheck,
  Globe,
  Clock
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Badge
} from '@/components/ui';

// Subscription plan details
const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    interval: null,
    listingLimit: 25,
    features: [
      'Connect up to 3 listing sites',
      'Basic listing management',
      'Manual sync required',
      'Standard support'
    ],
    limitations: [
      'Limited to 25 listings',
      'No automatic sync',
      'Basic analytics only'
    ]
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited listings',
      'Connect unlimited sites',
      'Automatic daily sync',
      'Priority support',
      'Advanced analytics'
    ],
    limitations: []
  }
};

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded: isUserLoaded } = useUser();
  
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check for success or canceled from URL params (after Stripe redirect)
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');
  
  // Fetch user's subscription information
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isUserLoaded || !user) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/subscriptions/current');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription details');
        }
        
        const data = await response.json();
        setUserPlan(data.plan_type || 'free');
        setSubscription(data.subscription || null);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setError('Failed to load subscription information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscription();
  }, [isUserLoaded, user]);
  
  // Handle subscription upgrade
  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const data = await response.json();
      
      // Check if user is already subscribed
      if (data.alreadySubscribed) {
        setUserPlan('pro');
        return;
      }
      
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Error upgrading subscription:', error);
      setError(error.message || 'Failed to upgrade subscription');
    } finally {
      setIsUpgrading(false);
    }
  };
  
  // Handle subscription cancellation
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your Pro subscription? You will lose access to Pro features when your current billing period ends.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }
      
      // Refresh subscription info
      window.location.reload();
    } catch (error: any) {
      console.error('Error canceling subscription:', error);
      setError(error.message || 'Failed to cancel subscription');
    }
  };
  
  // Format subscription end date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Display a message based on URL params after Stripe redirect
  const getStatusMessage = () => {
    if (success === 'true') {
      return {
        type: 'success',
        message: 'Your subscription has been successfully activated! You now have access to all Pro features.'
      };
    }
    
    if (canceled === 'true') {
      return {
        type: 'warning',
        message: 'You canceled the subscription process. If you have any questions, please contact support.'
      };
    }
    
    return null;
  };
  
  const statusMessage = getStatusMessage();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Manage your subscription plan and billing information
        </p>
        
        {/* Status message after Stripe redirect */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            statusMessage.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {statusMessage.type === 'success' ? (
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2" />
                {statusMessage.message}
              </div>
            ) : (
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {statusMessage.message}
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-sm">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Current Plan Info */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Your current subscription plan and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold mr-2">
                        {userPlan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                      </h3>
                      <Badge variant={userPlan === 'pro' ? 'success' : 'default'}>
                        {userPlan === 'pro' ? 'Active' : 'Free Tier'}
                      </Badge>
                    </div>
                    
                    {userPlan === 'pro' && subscription ? (
                      <div className="text-gray-600 dark:text-gray-400 space-y-1">
                        <p className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                          Billing: ${SUBSCRIPTION_PLANS.PRO.price}/month
                        </p>
                        {subscription.current_period_end && (
                          <p className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            Next billing date: {formatDate(subscription.current_period_end)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-600 dark:text-gray-400">
                        <p className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                          Limited to {SUBSCRIPTION_PLANS.FREE.listingLimit} listings
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0">
                    {userPlan === 'free' ? (
                      <Button 
                        onClick={handleUpgrade}
                        disabled={isUpgrading}
                      >
                        {isUpgrading ? 'Processing...' : 'Upgrade to Pro'}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                      >
                        Cancel Subscription
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Plan Comparison */}
            <h2 className="text-2xl font-bold mb-6">Compare Plans</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Free Plan */}
              <Card className={userPlan === 'free' ? 'border-blue-500 dark:border-blue-700' : ''}>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Basic features for getting started</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-2xl font-bold">$0</p>
                    <p className="text-gray-600 dark:text-gray-400">Forever free</p>
                  </div>
                  
                  <div className="space-y-3">
                    {SUBSCRIPTION_PLANS.FREE.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    
                    {SUBSCRIPTION_PLANS.FREE.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start">
                        <X className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                        <span className="text-gray-600 dark:text-gray-400">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  {userPlan === 'free' ? (
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Downgrade
                    </Button>
                  )}
                </CardFooter>
              </Card>
              
              {/* Pro Plan */}
              <Card className={userPlan === 'pro' ? 'border-blue-500 dark:border-blue-700' : 'bg-blue-50 dark:bg-blue-900/20'}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Pro</CardTitle>
                      <CardDescription>For power users and businesses</CardDescription>
                    </div>
                    {userPlan !== 'pro' && (
                      <Badge variant="primary">Recommended</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-2xl font-bold">${SUBSCRIPTION_PLANS.PRO.price}</p>
                    <p className="text-gray-600 dark:text-gray-400">per month</p>
                  </div>
                  
                  <div className="space-y-3">
                    {SUBSCRIPTION_PLANS.PRO.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  {userPlan === 'pro' ? (
                    <Button 
                      className="w-full"
                      variant="outline"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={handleUpgrade}
                      disabled={isUpgrading}
                    >
                      {isUpgrading ? 'Processing...' : 'Upgrade to Pro'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </div>
            
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Need help? <a href="#" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Contact our support team</a></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 