import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Site {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  url: string;
  auth_method: 'oauth' | 'direct' | 'api_key';
}

interface ConnectedSite {
  site_id: string;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all available sites from the database
    const { data: availableSites, error: sitesError } = await supabase
      .from('sites')
      .select('*')
      .order('name');

    if (sitesError) {
      console.error('Error fetching available sites:', sitesError);
      return NextResponse.json(
        { error: 'Failed to fetch available sites' },
        { status: 500 }
      );
    }

    if (!availableSites) {
      return NextResponse.json([]);
    }

    // Get user's already connected sites
    const { data: connectedSites, error: connectedSitesError } = await supabase
      .from('connected_sites')
      .select('site_id')
      .eq('user_id', userId);

    if (connectedSitesError) {
      console.error('Error fetching connected sites:', connectedSitesError);
      return NextResponse.json(
        { error: 'Failed to fetch connected sites' },
        { status: 500 }
      );
    }

    const connectedSiteIds = new Set(
      (connectedSites || []).map((site) => site.site_id)
    );

    // Prepare the authentication URLs for OAuth-based sites
    const sitesWithConnectionStatus = availableSites.map((site: Site) => {
      const isConnected = connectedSiteIds.has(site.id);
      
      // In a real implementation, you would generate proper OAuth URLs
      // For now we'll use a placeholder that could be replaced later
      const authUrl = site.auth_method === 'oauth' 
        ? `/api/auth/${site.id}/authorize?userId=${userId}` 
        : undefined;
      
      return {
        ...site,
        is_connected: isConnected,
        auth_url: authUrl
      };
    });

    return NextResponse.json(sitesWithConnectionStatus);
  } catch (error) {
    console.error('Error in available sites API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 