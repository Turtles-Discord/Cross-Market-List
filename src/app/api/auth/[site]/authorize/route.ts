import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock OAuth configuration for different sites
const OAUTH_CONFIGS = {
  facebook: {
    authUrl: 'https://www.facebook.com/v17.0/dialog/oauth',
    clientId: process.env.FACEBOOK_CLIENT_ID || 'mock-facebook-client-id',
    scope: 'email,public_profile,marketplace_management',
  },
  ebay: {
    authUrl: 'https://auth.ebay.com/oauth2/authorize',
    clientId: process.env.EBAY_CLIENT_ID || 'mock-ebay-client-id',
    scope: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory',
  },
  etsy: {
    authUrl: 'https://www.etsy.com/oauth/connect',
    clientId: process.env.ETSY_CLIENT_ID || 'mock-etsy-client-id',
    scope: 'transactions_r transactions_w listings_r listings_w',
  },
  mercari: {
    authUrl: 'https://www.mercari.com/oauth/authorize',
    clientId: process.env.MERCARI_CLIENT_ID || 'mock-mercari-client-id',
    scope: 'read_listings write_listings',
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { site: string } }
) {
  try {
    // Get user authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the site ID from the path parameter
    const siteId = params.site;
    
    // Check if it's a supported OAuth site
    const oauthConfig = OAUTH_CONFIGS[siteId as keyof typeof OAUTH_CONFIGS];
    if (!oauthConfig) {
      return NextResponse.json(
        { error: `OAuth not supported for site: ${siteId}` },
        { status: 400 }
      );
    }
    
    // Verify that the site exists in our database
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, name')
      .eq('id', siteId)
      .single();
    
    if (siteError || !site) {
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }
    
    // Save an OAuth state parameter to validate the callback
    const state = `${siteId}_${userId}_${Date.now()}`;
    
    // In a real implementation, we would store this state in a database or Redis
    // This would be used to validate when the OAuth provider calls back
    
    // Store the OAuth state temporarily (in a real app, this would go to Redis or database)
    const { error: stateError } = await supabase
      .from('oauth_states')
      .insert({
        state,
        user_id: userId,
        site_id: siteId,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString() // 1 hour expiration
      });
    
    if (stateError) {
      console.error('Error storing OAuth state:', stateError);
      return NextResponse.json(
        { error: 'Failed to initialize OAuth flow' },
        { status: 500 }
      );
    }
    
    // Build the redirect URL
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/${siteId}/callback`;
    
    // Construct the OAuth authorization URL
    const authUrl = new URL(oauthConfig.authUrl);
    authUrl.searchParams.append('client_id', oauthConfig.clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', oauthConfig.scope);
    authUrl.searchParams.append('response_type', 'code');
    
    // Redirect to the OAuth provider
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Error in OAuth authorization:', error);
    // Redirect to error page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/sites/connect?error=authorization_failed`);
  }
} 