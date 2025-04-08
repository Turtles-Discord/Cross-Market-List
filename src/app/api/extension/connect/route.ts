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
  console.log('Extension connect request received');
  
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      console.error('Unauthorized extension connection attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }
    
    // Parse request data
    const data = await req.json();
    console.log('Extension data received:', JSON.stringify(data));
    
    const { siteId, siteUrl, siteName, sessionData } = data;
    
    if (!siteId || !siteUrl) {
      console.error('Missing required fields in extension connection request');
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
      
      // If site doesn't exist, create it
      const { data: newSite, error: createError } = await supabase
        .from('sites')
        .insert({
          id: siteId,
          name: siteName || siteId,
          url: siteUrl
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating site:', createError);
        return NextResponse.json({ error: 'Failed to create site' }, { status: 500, headers: corsHeaders });
      }
      
      console.log('Created new site:', newSite);
    }
    
    // Get the site ID (either existing or newly created)
    const site = existingSite || { id: siteId };
    
    // Check if user already has this site connected
    const { data: existingConnection, error: connectionError } = await supabase
      .from('connected_sites')
      .select('id')
      .eq('user_id', userId)
      .eq('site_id', site.id)
      .single();
    
    // Prepare credentials object from session data
    const credentials = sessionData ? {
      username: sessionData.username,
      token: sessionData.token || null,
      cookies: sessionData.cookies || null,
      timestamp: new Date().toISOString()
    } : null;
    
    // If connection exists, update it
    if (existingConnection) {
      console.log('Updating existing connection for site:', site.id);
      
      const { error: updateError } = await supabase
        .from('connected_sites')
        .update({
          is_active: true,
          access_token: credentials?.token || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id);
      
      if (updateError) {
        console.error('Error updating connection:', updateError);
        return NextResponse.json({ error: 'Failed to update connection' }, { status: 500, headers: corsHeaders });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Connection updated successfully',
        connection: {
          id: existingConnection.id,
          site_id: site.id
        }
      }, { headers: corsHeaders });
    } else {
      // Create new connection
      console.log('Creating new connection for site:', site.id);
      
      const { data: newConnection, error: insertError } = await supabase
        .from('connected_sites')
        .insert({
          user_id: userId,
          site_id: site.id,
          is_active: true,
          access_token: credentials?.token || null
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating connection:', insertError);
        return NextResponse.json({ error: 'Failed to create connection' }, { status: 500, headers: corsHeaders });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Site connected successfully',
        connection: newConnection
      }, { headers: corsHeaders });
    }
  } catch (error) {
    console.error('Error in extension connect API:', error);
    return NextResponse.json({ 
      error: 'Server error processing extension connection' 
    }, { status: 500, headers: corsHeaders });
  }
} 