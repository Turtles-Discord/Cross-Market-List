import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * API endpoint to sync listings from all connected sites
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's plan type to check for limits
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('plan_type, listings_count')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user details' },
        { status: 500 }
      );
    }
    
    // Check for free plan limits
    const isFree = user.plan_type === 'free';
    const freePlanLimit = SUBSCRIPTION_PLANS.FREE.listingLimit;
    let remainingSlots = isFree ? Math.max(0, freePlanLimit - user.listings_count) : Infinity;
    
    if (isFree && remainingSlots === 0) {
      return NextResponse.json({
        success: false,
        message: `You've reached the limit of ${freePlanLimit} listings on the Free plan. Upgrade to Pro for unlimited listings.`,
        canSync: false
      });
    }
    
    // Get all active connected sites
    const { data: connectedSites, error: sitesError } = await supabase
      .from('connected_sites')
      .select(`
        id,
        site_id,
        is_active,
        credentials,
        last_synced_at,
        site:sites(id, name, url, api_endpoint)
      `)
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (sitesError) {
      console.error('Error fetching connected sites:', sitesError);
      return NextResponse.json(
        { error: 'Failed to fetch connected sites' },
        { status: 500 }
      );
    }
    
    if (!connectedSites || connectedSites.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active connected sites found',
        canSync: false
      });
    }
    
    // Process each connected site and fetch listings
    const syncResults = [];
    let totalNewListings = 0;
    
    for (const connection of connectedSites) {
      try {
        const site = connection.site[0];
        if (!site || !site.api_endpoint) {
          throw new Error(`No API endpoint found for site ${connection.site_id}`);
        }
        
        // Fetch listings data from site API or database
        // This would typically involve calling an external API with the stored credentials
        // For now, we'll simulate this with a fetch to our own API that would then talk to the external site
        
        // Check when the site was last synced
        const lastSyncTime = connection.last_synced_at ? new Date(connection.last_synced_at) : null;
        const currentTime = new Date();
        
        // If the site was synced within the last hour and user is on free plan, skip
        if (isFree && lastSyncTime && (currentTime.getTime() - lastSyncTime.getTime() < 3600000)) {
          syncResults.push({
            site_id: connection.site_id,
            site_name: site.name,
            success: true,
            listings_added: 0,
            message: `Site was recently synced (within last hour). Free plan limited to hourly syncs.`
          });
          continue;
        }
        
        // Get existing listings for this site to avoid duplicates
        const { data: existingListings, error: existingError } = await supabase
          .from('listings')
          .select('external_id')
          .eq('user_id', userId)
          .eq('site_id', connection.site_id);
        
        if (existingError) {
          throw new Error(`Failed to fetch existing listings: ${existingError.message}`);
        }
        
        // Create a set of existing external IDs for quick lookup
        const existingExternalIds = new Set(existingListings?.map(l => l.external_id));
        
        // Make API call to fetch listings (in a real implementation)
        // For our implementation, we'll use a simulated response with randomized data
        // that represents what we'd get from an external API
        
        const credentials = connection.credentials;
        const newListings = [];
        
        // Simulate API response data - in a real implementation this would be actual API data
        // We're creating realistic simulated data to demonstrate the flow
        const categories = ['Electronics', 'Clothing', 'Home', 'Sports', 'Collectibles'];
        const statuses = ['active', 'draft', 'sold', 'pending'];
        const titlePrefixes = ['New', 'Used', 'Like New', 'Vintage', 'Rare', 'Brand New'];
        const titleItems = ['Laptop', 'Phone', 'Camera', 'Shirt', 'Shoes', 'Watch', 'Desk', 'Chair', 'Bike'];
        
        // Generate between 1-5 listings per site (simulating API response)
        // Number of listings would be determined by the actual API response in production
        const numListings = Math.floor(Math.random() * 5) + 1;
        
        for (let i = 0; i < numListings; i++) {
          // Skip if we've reached free plan limit
          if (isFree && remainingSlots <= 0) break;
          
          // Generate a unique external ID (simulating what we'd get from the external API)
          const externalId = `ext-${site.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
          
          // Skip if we already have this listing
          if (existingExternalIds.has(externalId)) continue;
          
          // Generate random listing data
          const titlePrefix = titlePrefixes[Math.floor(Math.random() * titlePrefixes.length)];
          const titleItem = titleItems[Math.floor(Math.random() * titleItems.length)];
          const category = categories[Math.floor(Math.random() * categories.length)];
          const price = Math.floor(Math.random() * 20000) / 100 + 10; // Between $10 and $210
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          // Create a listing object similar to what we'd get from an external API
          const listing = {
            user_id: userId,
            site_id: connection.site_id,
            external_id: externalId,
            title: `${titlePrefix} ${titleItem} - ${category}`,
            description: `This is a ${titlePrefix.toLowerCase()} ${titleItem.toLowerCase()} in the ${category.toLowerCase()} category. Listed on ${site.name}.`,
            price: price,
            currency: 'USD',
            status: status,
            url: `${site.url}/listing/${externalId}`,
            metadata: {
              category: category,
              condition: titlePrefix === 'New' || titlePrefix === 'Brand New' ? 'new' : 'used',
              source_site: site.name,
              sync_time: new Date().toISOString()
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            published_at: status === 'active' ? new Date().toISOString() : null
          };
          
          newListings.push(listing);
          remainingSlots--;
          totalNewListings++;
        }
        
        // Insert the listings into the database
        let insertedListings = [];
        if (newListings.length > 0) {
          const { data, error: insertError } = await supabase
            .from('listings')
            .insert(newListings)
            .select();
            
          if (insertError) {
            throw new Error(`Error inserting listings: ${insertError.message}`);
          }
          
          insertedListings = data || [];
          
          // Update the last_synced_at timestamp for this connection
          await supabase
            .from('connected_sites')
            .update({
              last_synced_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', connection.id);
        }
        
        // Add sync result for this site
        syncResults.push({
          site_id: connection.site_id,
          site_name: site.name,
          success: true,
          listings_added: insertedListings.length,
          listings: insertedListings.map(l => ({ id: l.id, title: l.title, status: l.status }))
        });
        
      } catch (error: any) {
        console.error(`Error syncing site ${connection.site_id}:`, error);
        syncResults.push({
          site_id: connection.site_id,
          site_name: connection.site?.[0]?.name || 'Unknown site',
          success: false,
          error: error.message || 'An unknown error occurred',
          listings_added: 0
        });
      }
    }
    
    // Update the user's listings count
    if (totalNewListings > 0) {
      await supabase
        .from('users')
        .update({
          listings_count: user.listings_count + totalNewListings,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Sync completed successfully',
      results: syncResults,
      total_new_listings: totalNewListings,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in sync listings API:', error);
    return NextResponse.json(
      { error: 'An error occurred while syncing listings' },
      { status: 500 }
    );
  }
} 