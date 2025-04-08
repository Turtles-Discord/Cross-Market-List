import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Mock OAuth token endpoints for different sites
const OAUTH_CONFIGS = {
  facebook: {
    tokenUrl: 'https://graph.facebook.com/v17.0/oauth/access_token',
    clientId: process.env.FACEBOOK_CLIENT_ID || 'mock-facebook-client-id',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'mock-facebook-client-secret',
  },
  ebay: {
    tokenUrl: 'https://api.ebay.com/identity/v1/oauth2/token',
    clientId: process.env.EBAY_CLIENT_ID || 'mock-ebay-client-id',
    clientSecret: process.env.EBAY_CLIENT_SECRET || 'mock-ebay-client-secret',
  },
  etsy: {
    tokenUrl: 'https://api.etsy.com/v3/public/oauth/token',
    clientId: process.env.ETSY_CLIENT_ID || 'mock-etsy-client-id',
    clientSecret: process.env.ETSY_CLIENT_SECRET || 'mock-etsy-client-secret',
  },
  mercari: {
    tokenUrl: 'https://www.mercari.com/oauth/token',
    clientId: process.env.MERCARI_CLIENT_ID || 'mock-mercari-client-id',
    clientSecret: process.env.MERCARI_CLIENT_SECRET || 'mock-mercari-client-secret',
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: { site: string } }
) {
  const { site } = params;
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');
  
  // Handle authentication
  const authResult = await auth();
  const userId = authResult.userId;
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Check if we got an error from the OAuth provider
  if (error) {
    console.error(`OAuth error: ${error} - ${errorDescription}`);
    return NextResponse.redirect(
      `${url.origin}/sites/connect?error=${encodeURIComponent(errorDescription || error)}`
    );
  }
  
  // Validate required parameters
  if (!code) {
    return NextResponse.redirect(
      `${url.origin}/sites/connect?error=${encodeURIComponent('Missing authorization code')}`
    );
  }
  
  if (!state) {
    return NextResponse.redirect(
      `${url.origin}/sites/connect?error=${encodeURIComponent('Missing state parameter')}`
    );
  }
  
  try {
    // Verify the state parameter matches what we stored earlier
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('state, site_id')
      .eq('state', state)
      .eq('user_id', userId)
      .single();
    
    if (stateError || !stateData) {
      console.error('Invalid state parameter:', stateError);
      return NextResponse.redirect(
        `${url.origin}/sites/connect?error=${encodeURIComponent('Invalid state parameter')}`
      );
    }
    
    // Get site configuration
    const { data: siteData, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', stateData.site_id)
      .single();
    
    if (siteError || !siteData) {
      console.error('Site not found:', siteError);
      return NextResponse.redirect(
        `${url.origin}/sites/connect?error=${encodeURIComponent('Site configuration not found')}`
      );
    }
    
    // Exchange authorization code for tokens
    // In a real implementation, we would make an API call to the OAuth provider
    const tokenEndpoint = siteData.token_endpoint || 'https://api.example.com/oauth/token';
    const clientId = process.env[`${site.toUpperCase()}_CLIENT_ID`] || '';
    const clientSecret = process.env[`${site.toUpperCase()}_CLIENT_SECRET`] || '';
    const redirectUri = `${url.origin}/api/auth/${site}/callback`;
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });
    
    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text();
      console.error('Token exchange error:', tokenError);
      return NextResponse.redirect(
        `${url.origin}/sites/connect?error=${encodeURIComponent('Failed to exchange authorization code for token')}`
      );
    }
    
    const tokenData = await tokenResponse.json();
    
    // Check if user already has a connection to this site
    const { data: existingConnection, error: connectionError } = await supabase
      .from('connected_sites')
      .select('id')
      .eq('user_id', userId)
      .eq('site_id', stateData.site_id)
      .single();
    
    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from('connected_sites')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: tokenData.expires_in 
            ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
            : null,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id);
      
      if (updateError) {
        console.error('Error updating connection:', updateError);
        return NextResponse.redirect(
          `${url.origin}/sites/connect?error=${encodeURIComponent('Failed to update site connection')}`
        );
      }
    } else {
      // Create new connection
      const { error: insertError } = await supabase
        .from('connected_sites')
        .insert({
          user_id: userId,
          site_id: stateData.site_id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_expires_at: tokenData.expires_in 
            ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
            : null,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (insertError) {
        console.error('Error creating connection:', insertError);
        return NextResponse.redirect(
          `${url.origin}/sites/connect?error=${encodeURIComponent('Failed to create site connection')}`
        );
      }
    }
    
    // Clean up the state record
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state)
      .eq('user_id', userId);
    
    // Redirect to successful connection page
    return NextResponse.redirect(
      `${url.origin}/sites?success=true&site=${encodeURIComponent(siteData.name)}`
    );
    
  } catch (error) {
    console.error('Error processing callback:', error);
    return NextResponse.redirect(
      `${url.origin}/sites/connect?error=${encodeURIComponent('An unexpected error occurred')}`
    );
  }
} 