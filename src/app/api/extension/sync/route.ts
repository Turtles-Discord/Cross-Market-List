import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers to allow the extension to communicate with the API
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  console.log('Extension sync request received');
  
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      console.error('Unauthorized extension sync attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }
    
    // Parse request data
    const data = await req.json();
    console.log('Extension sync data received:', JSON.stringify(data));
    
    const { siteId, listings } = data;
    
    if (!siteId) {
      console.error('Missing required fields in extension sync request');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400, headers: corsHeaders });
    }
    
    // Check if site exists in our database
    const { data: existingSite, error: siteError } = await supabase
      .from('sites')
      .select('id, name, url')
      .eq('id', siteId)
      .single();
    
    if (siteError) {
      console.error('Error finding site:', siteError);
      return NextResponse.json({ error: 'Site not found' }, { status: 404, headers: corsHeaders });
    }
    
    console.log('Found matching site for sync:', existingSite);
    
    // Check if user has this site connected
    const { data: connectedSite, error: connectionError } = await supabase
      .from('connected_sites')
      .select('id')
      .eq('user_id', userId)
      .eq('site_id', siteId)
      .single();
    
    if (connectionError) {
      console.error('Site not connected for this user:', connectionError);
      return NextResponse.json({ error: 'Site not connected for this user' }, { status: 400, headers: corsHeaders });
    }
    
    // Process listings if provided
    let newItemsCount = 0;
    if (listings && Array.isArray(listings) && listings.length > 0) {
      console.log(`Processing ${listings.length} listings from extension`);
      
      for (const listing of listings) {
        // Check if listing already exists
        const { data: existingListing, error: listingError } = await supabase
          .from('listings')
          .select('id')
          .eq('user_id', userId)
          .eq('site_id', siteId)
          .eq('url', listing.url)
          .single();
        
        if (existingListing) {
          console.log(`Listing already exists: ${listing.title}`);
          continue;
        }
        
        // Insert new listing
        const { error: insertError } = await supabase
          .from('listings')
          .insert({
            user_id: userId,
            site_id: siteId,
            title: listing.title,
            description: listing.description || '',
            price: parseFloat(listing.price.replace(/[^0-9.]/g, '')) || 0,
            currency: listing.price.match(/[$€£¥]/)?.[0] || 'USD',
            status: 'active',
            url: listing.url,
            metadata: listing,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`Error inserting listing: ${listing.title}`, insertError);
        } else {
          newItemsCount++;
        }
      }
      
      // Update user's listings count
      if (newItemsCount > 0) {
        // Get current count
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('listings_count')
          .eq('id', userId)
          .single();
        
        if (!userError && user) {
          // Update the count
          await supabase
            .from('users')
            .update({
              listings_count: user.listings_count + newItemsCount,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
      }
    }
    
    // Update last_synced_at for the connected site
    await supabase
      .from('connected_sites')
      .update({
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', connectedSite.id);
    
    return NextResponse.json({
      success: true,
      message: 'Sync successful',
      newItems: newItemsCount
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error in extension sync API:', error);
    return NextResponse.json({
      error: 'Server error processing extension sync'
    }, { status: 500, headers: corsHeaders });
  }
} 