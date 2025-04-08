import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const siteId = params.id;

    // Get site connection details
    const { data: connection, error: connectionError } = await supabase
      .from('connected_sites')
      .select(`
        *,
        site:sites(id, name, url, logo_url, api_endpoint)
      `)
      .eq('user_id', userId)
      .eq('site_id', siteId)
      .single();

    if (connectionError) {
      console.error('Error fetching site connection:', connectionError);
      return NextResponse.json(
        { error: 'Site connection not found' },
        { status: 404 }
      );
    }

    // Get listing statistics
    const { data: listings, error: listingsError } = await supabase
      .from('listings')
      .select('status')
      .eq('user_id', userId)
      .eq('site_id', siteId);

    if (listingsError) {
      console.error('Error fetching listing statistics:', listingsError);
      // Continue with the connection data but no stats
    }

    // Calculate stats
    const stats = {
      total: listings?.length || 0,
      active: listings?.filter(l => l.status === 'active').length || 0,
      draft: listings?.filter(l => l.status === 'draft').length || 0,
      sold: listings?.filter(l => l.status === 'sold').length || 0
    };

    // Return the combined data
    return NextResponse.json({
      ...connection,
      stats
    });
  } catch (error) {
    console.error('Error in site details API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const siteId = params.id;

    // Verify that the connection exists and belongs to the user
    const { data: connection, error: connectionError } = await supabase
      .from('connected_sites')
      .select('id')
      .eq('user_id', userId)
      .eq('site_id', siteId)
      .single();

    if (connectionError) {
      console.error('Error finding site connection:', connectionError);
      return NextResponse.json(
        { error: 'Site connection not found' },
        { status: 404 }
      );
    }

    // Delete the connection
    const { error: deleteError } = await supabase
      .from('connected_sites')
      .delete()
      .eq('id', connection.id);

    if (deleteError) {
      console.error('Error deleting site connection:', deleteError);
      return NextResponse.json(
        { error: 'Failed to disconnect site' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Site disconnected successfully'
    });
  } catch (error) {
    console.error('Error in disconnect site API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 