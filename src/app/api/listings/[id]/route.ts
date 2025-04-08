import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get a specific listing by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const listingId = params.id;
    
    // Get the listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select(`
        *,
        site:sites(id, name, url, logo_url)
      `)
      .eq('id', listingId)
      .eq('user_id', userId)
      .single();
    
    if (listingError) {
      console.error('Error fetching listing:', listingError);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the listing' },
      { status: 500 }
    );
  }
}

// Update a listing
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const listingId = params.id;
    
    // First check if the listing exists and belongs to the user
    const { data: existingListing, error: checkError } = await supabase
      .from('listings')
      .select('id, site_id, status')
      .eq('id', listingId)
      .eq('user_id', userId)
      .single();
    
    if (checkError) {
      console.error('Error checking listing:', checkError);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Prepare the update data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    
    // Only include fields that are provided in the request
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.url !== undefined) updateData.url = body.url;
    if (body.metadata !== undefined) updateData.metadata = body.metadata;
    
    // If status changes to 'published', set published_at date
    if (body.status === 'active' && existingListing.status !== 'active') {
      updateData.published_at = new Date().toISOString();
    }
    
    // Update the listing
    const { data: updatedListing, error: updateError } = await supabase
      .from('listings')
      .update(updateData)
      .eq('id', listingId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating listing:', updateError);
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Listing updated successfully',
      data: updatedListing
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the listing' },
      { status: 500 }
    );
  }
}

// Delete a listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const listingId = params.id;
    
    // First check if the listing exists and belongs to the user
    const { data: existingListing, error: checkError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listingId)
      .eq('user_id', userId)
      .single();
    
    if (checkError) {
      console.error('Error checking listing:', checkError);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    // Delete the listing
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);
    
    if (deleteError) {
      console.error('Error deleting listing:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Listing deleted successfully',
      id: listingId
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the listing' },
      { status: 500 }
    );
  }
} 