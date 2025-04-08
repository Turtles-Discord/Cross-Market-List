import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PostgrestError } from '@supabase/supabase-js';
import { AppError } from '@/lib/errors';

export type DbResult<T> = Promise<{
  data: T | null;
  error: PostgrestError | null;
}>;

export type DbBulkResult<T> = Promise<{
  data: T[] | null;
  error: PostgrestError | null;
}>;

// User management
export async function getUserById(userId: string) {
  const supabase = await createClient();
  return supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
}

export async function updateUserPlan(userId: string, planType: 'free' | 'pro') {
  const supabase = await createClient();
  return supabase
    .from('users')
    .update({ plan_type: planType })
    .eq('id', userId);
}

export async function incrementUserListingsCount(userId: string) {
  const { data: user, error } = await getUserById(userId);
  
  if (error || !user) {
    throw new AppError('Error getting user', 400);
  }
  
  const supabase = await createClient();
  return supabase
    .from('users')
    .update({ listings_count: user.listings_count + 1 })
    .eq('id', userId);
}

// Listings management
export async function getUserListings(
  userId: string,
  { page = 1, limit = 10, status }: { page?: number; limit?: number; status?: string }
) {
  const supabase = await createClient();
  let query = supabase
    .from('listings')
    .select(`
      *,
      sites:site_id(id, name, url, logo_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (status) {
    query = query.eq('status', status);
  }
  
  return query
    .range((page - 1) * limit, page * limit - 1);
}

export async function getListingById(listingId: string, userId: string) {
  const supabase = await createClient();
  return supabase
    .from('listings')
    .select(`
      *,
      sites:site_id(id, name, url, logo_url)
    `)
    .eq('id', listingId)
    .eq('user_id', userId)
    .single();
}

export async function createListing(
  userId: string,
  data: {
    site_id: string;
    title: string;
    description?: string;
    price?: number;
    currency?: string;
    status?: string;
    external_id?: string;
    url?: string;
    metadata?: Record<string, any>;
  }
) {
  const supabase = await createClient();
  return supabase
    .from('listings')
    .insert({
      user_id: userId,
      ...data,
    })
    .select()
    .single();
}

export async function updateListing(
  listingId: string,
  userId: string,
  data: Partial<{
    title: string;
    description: string;
    price: number;
    currency: string;
    status: string;
    url: string;
    metadata: Record<string, any>;
  }>
) {
  const supabase = await createClient();
  return supabase
    .from('listings')
    .update(data)
    .eq('id', listingId)
    .eq('user_id', userId)
    .select()
    .single();
}

export async function deleteListing(listingId: string, userId: string) {
  const supabase = await createClient();
  return supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('user_id', userId);
}

// Sites management
export async function getAvailableSites() {
  const supabase = await createClient();
  return supabase
    .from('sites')
    .select('*')
    .order('name');
}

export async function getUserConnectedSites(userId: string) {
  const supabase = await createClient();
  return supabase
    .from('connected_sites')
    .select(`
      *,
      sites:site_id(id, name, url, logo_url)
    `)
    .eq('user_id', userId);
}

export async function connectUserToSite(
  userId: string,
  siteId: string,
  credentials: Record<string, any>
) {
  const supabase = await createClient();
  return supabase
    .from('connected_sites')
    .insert({
      user_id: userId,
      site_id: siteId,
      credentials,
    })
    .select()
    .single();
}

export async function disconnectUserFromSite(userId: string, siteId: string) {
  const supabase = await createClient();
  return supabase
    .from('connected_sites')
    .delete()
    .eq('user_id', userId)
    .eq('site_id', siteId);
}

export async function updateSiteConnectionStatus(
  connectionId: string,
  userId: string,
  isActive: boolean
) {
  const supabase = await createClient();
  return supabase
    .from('connected_sites')
    .update({ is_active: isActive })
    .eq('id', connectionId)
    .eq('user_id', userId);
}

/**
 * Updates the last_synced_at timestamp for the given connected sites
 */
export async function updateSyncTimestamp(connectionIds: string[]) {
  try {
    if (!connectionIds || connectionIds.length === 0) {
      return { error: { message: 'No connection IDs provided' } };
    }
    
    const timestamp = new Date().toISOString();
    
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('connected_sites')
      .update({ 
        last_synced_at: timestamp,
        updated_at: timestamp
      })
      .in('id', connectionIds);
    
    if (error) {
      console.error('Error updating sync timestamp:', error);
      return { error };
    }
    
    return { data };
  } catch (error) {
    console.error('Error in updateSyncTimestamp:', error);
    return { error: { message: 'Failed to update sync timestamp' } };
  }
}

// Subscription management
export async function getUserSubscription(userId: string) {
  const supabase = await createClient();
  return supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();
}

export async function createOrUpdateSubscription(
  userId: string,
  data: {
    stripe_customer_id: string;
    stripe_subscription_id: string;
    plan_type: 'free' | 'pro';
    status: string;
    current_period_start: string;
    current_period_end: string;
  }
) {
  // First check if the user already has a subscription
  const { data: existingSubscription, error } = await getUserSubscription(userId);
  
  const supabase = await createClient();
  
  if (!existingSubscription || error) {
    // Create new subscription
    return supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        ...data,
      })
      .select()
      .single();
  } else {
    // Update existing subscription
    return supabase
      .from('subscriptions')
      .update(data)
      .eq('id', existingSubscription.id)
      .select()
      .single();
  }
}

// Admin operations - use with caution
export async function initializeUserData(userId: string, email: string) {
  // This should only be used when a user is first created
  return supabaseAdmin
    .from('users')
    .insert({
      id: userId,
      email,
      plan_type: 'free',
      listings_count: 0,
    })
    .select()
    .single();
}

export async function adminDeleteUser(userId: string) {
  // This will cascade delete all user data due to foreign key constraints
  return supabaseAdmin
    .from('users')
    .delete()
    .eq('id', userId);
}

export async function seedInitialSites() {
  const sites = [
    {
      name: 'Facebook Marketplace',
      url: 'https://www.facebook.com/marketplace',
      logo_url: '/images/sites/facebook.svg',
      api_endpoint: 'https://graph.facebook.com/v18.0/marketplace',
    },
    {
      name: 'Craigslist',
      url: 'https://www.craigslist.org',
      logo_url: '/images/sites/craigslist.svg',
      api_endpoint: 'https://api.craigslist.org/v1',
    },
    {
      name: 'eBay',
      url: 'https://www.ebay.com',
      logo_url: '/images/sites/ebay.svg',
      api_endpoint: 'https://api.ebay.com/sell/inventory/v1',
    },
    {
      name: 'Shopify',
      url: 'https://www.shopify.com',
      logo_url: '/images/sites/shopify.svg',
      api_endpoint: 'https://shopify.dev/api/admin-rest',
    },
    {
      name: 'Etsy',
      url: 'https://www.etsy.com',
      logo_url: '/images/sites/etsy.svg',
      api_endpoint: 'https://openapi.etsy.com/v3',
    },
  ];
  
  return supabaseAdmin
    .from('sites')
    .upsert(
      sites.map((site) => ({
        ...site,
        // Use the name as a stable identifier for upsert
        id: site.name.toLowerCase().replace(/\s+/g, '-'),
      })),
      { onConflict: 'name' }
    )
    .select();
}

// Get user by Stripe customer ID
export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const supabase = await createClient();
  return supabase
    .from('users')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();
}

// Update user's subscription status
export async function updateUserSubscription({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  planType,
  status,
  currentPeriodStart,
  currentPeriodEnd,
}: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  planType: 'free' | 'pro';
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
}) {
  const supabase = await createClient();
  
  // Update the user's plan type
  const userUpdate = await supabase
    .from('users')
    .update({
      plan_type: planType,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  
  if (userUpdate.error) {
    console.error('Error updating user plan:', userUpdate.error);
    throw userUpdate.error;
  }
  
  // If there's an active subscription, update it or create it
  if (stripeSubscriptionId) {
    // Check if a subscription record already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (existingSubscription) {
      // Update existing subscription
      return supabase
        .from('subscriptions')
        .update({
          stripe_subscription_id: stripeSubscriptionId,
          plan_type: planType,
          status: status,
          current_period_start: currentPeriodStart ? currentPeriodStart.toISOString() : null,
          current_period_end: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingSubscription.id);
    } else {
      // Create new subscription
      return supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscriptionId,
          plan_type: planType,
          status: status,
          current_period_start: currentPeriodStart ? currentPeriodStart.toISOString() : null,
          current_period_end: currentPeriodEnd ? currentPeriodEnd.toISOString() : null,
        });
    }
  } else if (status === 'canceled') {
    // If the subscription is canceled, delete the subscription record
    return supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId);
  }
}

// Check if user can perform an action that requires a pro subscription
export async function checkProAccess(userId: string) {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    console.error('Error checking pro access:', error);
    return { hasAccess: false, error };
  }
  
  const isPro = user.plan_type === 'pro';
  return { hasAccess: isPro, error: null };
}

// Check if user has reached the free plan listing limit
export async function checkListingLimit(userId: string) {
  const supabase = await createClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('plan_type, listings_count')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    console.error('Error checking listing limit:', error);
    return { 
      canCreate: false, 
      error,
      message: 'Error checking listing limits'
    };
  }
  
  // If user is pro, they have unlimited listings
  if (user.plan_type === 'pro') {
    return { canCreate: true, error: null };
  }
  
  // Check if user has reached the free plan limit
  const hasReachedLimit = user.listings_count >= 25; // Free plan limit
  
  return {
    canCreate: !hasReachedLimit,
    error: null,
    message: hasReachedLimit
      ? 'You\'ve reached the limit of 25 listings on the Free plan. Upgrade to Pro for unlimited listings.'
      : null,
    remaining: hasReachedLimit ? 0 : 25 - user.listings_count
  };
}

/**
 * Get the total number of listings by platform for a user
 */
export async function getTotalListingsByPlatform(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('get_listings_by_platform', { user_id_param: userId });

    // Format the data for easier consumption
    const formattedData = data?.map((item: any) => ({
      platform_id: item.site.id,
      platform_name: item.site.name,
      count: parseInt(item.count)
    })) || [];

    return { data: formattedData, error };
  } catch (error) {
    console.error('Error getting listings by platform:', error);
    return { data: null, error };
  }
}

/**
 * Connect a site to a user's account
 */
export async function connectSite({
  userId,
  siteId,
  credentials
}: {
  userId: string;
  siteId: string;
  credentials: any;
}) {
  try {
    // In a real implementation, this would store the connection in the database
    // For now, we just log the connection
    console.log(`Connecting site ${siteId} for user ${userId}`);
    console.log('Credentials:', JSON.stringify(credentials, null, 2));
    
    // Generate a fake connection ID
    const connectionId = `connection_${Date.now()}`;
    
    return {
      data: {
        id: connectionId,
        userId,
        siteId,
        status: 'active',
        lastSynced: null,
        createdAt: new Date().toISOString()
      },
      error: null
    };
  } catch (error: any) {
    console.error('Error connecting site:', error);
    return {
      data: null,
      error: error.message
    };
  }
}

/**
 * Get detailed information about a user's connected site
 */
export async function getSiteConnectionDetails(userId: string, siteId: string) {
  try {
    const supabase = await createClient();
    const { data: connection, error: connectionError } = await supabase
      .from('connected_sites')
      .select(`
        *,
        site:site_id(*)
      `)
      .eq('user_id', userId)
      .eq('site_id', siteId)
      .single();
    
    if (connectionError) {
      return { data: null, error: connectionError };
    }
    
    // Get listing stats for this site
    const { data: listingStats, error: listingError } = await supabase
      .from('listings')
      .select('id, status')
      .eq('user_id', userId)
      .eq('site_id', siteId);
    
    if (listingError) {
      return { data: connection, error: listingError };
    }
    
    // Calculate listing stats
    const stats = {
      total: listingStats?.length || 0,
      active: listingStats?.filter(l => l.status === 'active').length || 0,
      draft: listingStats?.filter(l => l.status === 'draft').length || 0,
      sold: listingStats?.filter(l => l.status === 'sold').length || 0
    };
    
    return {
      data: {
        ...connection,
        stats
      },
      error: null
    };
  } catch (error: any) {
    console.error('Error getting site connection details:', error);
    return { data: null, error: error.message };
  }
} 