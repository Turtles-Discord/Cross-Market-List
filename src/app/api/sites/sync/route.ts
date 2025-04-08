import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SyncRequestBody {
  siteId: string;
}

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body: SyncRequestBody = await request.json();

    if (!body.siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Get site connection details
    const { data: connection, error: connectionError } = await supabase
      .from('connected_sites')
      .select('*')
      .eq('user_id', userId)
      .eq('site_id', body.siteId)
      .eq('is_active', true)
      .single();

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'Site connection not found' },
        { status: 404 }
      );
    }

    // Update sync timestamp
    const { error: updateError } = await supabase
      .from('connected_sites')
      .update({
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', connection.id);

    if (updateError) {
      console.error('Error updating sync timestamp:', updateError);
      return NextResponse.json(
        { error: 'Failed to update sync timestamp' },
        { status: 500 }
      );
    }

    // In a real implementation, this would trigger a background job to:
    // 1. Fetch listings from the marketplace site
    // 2. Process and save them to the database
    // 3. Update statistics and user counters
    
    // For now, we'll return a mock response
    return NextResponse.json({
      success: true,
      message: 'Sync started successfully',
      syncId: `sync-${Date.now()}`,
      stats: {
        newListings: 2,
        updatedListings: 3,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in sync API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 