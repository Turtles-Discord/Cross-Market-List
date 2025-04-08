import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get connected sites count
    const { count: connectedSitesCount, error: connectedError } = await supabase
      .from('connected_sites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (connectedError) {
      console.error('Error fetching connected sites:', connectedError);
    }

    // Get active listings count
    const { count: activeListingsCount, error: listingsError } = await supabase
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (listingsError) {
      console.error('Error fetching active listings:', listingsError);
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('listings_count')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
    }

    // Get total views (mocked for now)
    const totalViews = Math.floor(Math.random() * 100);

    return NextResponse.json({
      totalListings: user?.listings_count || 0,
      activeListings: activeListingsCount || 0,
      connectedSites: connectedSitesCount || 0,
      totalViews: totalViews
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
} 