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

    // Get recent listings with site info
    const { data: listings, error } = await supabase
      .from('listings')
      .select(`
        id, title, description, price, currency, status, url, created_at, published_at,
        sites:site_id (name, url, logo_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching recent listings:', error);
      return NextResponse.json({ error: 'Failed to fetch recent listings' }, { status: 500 });
    }

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    return NextResponse.json({ error: 'Failed to fetch recent listings' }, { status: 500 });
  }
} 