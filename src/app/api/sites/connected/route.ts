import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get connected sites with site details
    const { data, error } = await supabase
      .from('connected_sites')
      .select(`
        id,
        site_id,
        is_active,
        last_synced_at,
        created_at,
        updated_at,
        site:sites(
          id,
          name,
          url,
          logo_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching connected sites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch connected sites' },
        { status: 500 }
      );
    }
    
    // For each connected site, get the listings count
    const sitesWithStats = await Promise.all(
      (data || []).map(async (connection) => {
        // Get listings count for this site
        const { count, error: countError } = await supabase
          .from('listings')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .eq('site_id', connection.site_id);
        
        if (countError) {
          console.error('Error getting listings count:', countError);
        }
        
        return {
          ...connection,
          listings_count: count || 0
        };
      })
    );
    
    return NextResponse.json(sitesWithStats);
  } catch (error) {
    console.error('Error in connected sites API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 