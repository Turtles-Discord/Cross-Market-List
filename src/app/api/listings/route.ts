import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default values for pagination
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

export async function GET(request: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page') || DEFAULT_PAGE);
    const pageSize = Number(searchParams.get('pageSize') || DEFAULT_PAGE_SIZE);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || null;
    const platform = searchParams.get('platform') || null;
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page parameter' },
        { status: 400 }
      );
    }
    
    if (isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: 'Invalid pageSize parameter (must be between 1 and 100)' },
        { status: 400 }
      );
    }
    
    // Calculate pagination offset
    const offset = (page - 1) * pageSize;
    
    // Build the query for counting
    let countQuery = supabase
      .from('listings')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);
    
    // Apply filters to count query
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    
    if (platform) {
      countQuery = countQuery.eq('site_id', platform);
    }
    
    // Get total count
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error getting total count:', countError);
      return NextResponse.json(
        { error: 'Failed to count listings' },
        { status: 500 }
      );
    }
    
    // Build the query for data
    let dataQuery = supabase
      .from('listings')
      .select(`
        *,
        site:sites(id, name, url, logo_url)
      `)
      .eq('user_id', userId);
    
    // Apply filters to data query
    if (search) {
      dataQuery = dataQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    if (status) {
      dataQuery = dataQuery.eq('status', status);
    }
    
    if (platform) {
      dataQuery = dataQuery.eq('site_id', platform);
    }
    
    // Apply sorting and pagination
    dataQuery = dataQuery
      .order(sortBy as any, { ascending: sortOrder === 'asc' })
      .range(offset, offset + pageSize - 1);
    
    // Execute the query
    const { data: listings, error: listingsError } = await dataQuery;
    
    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }
    
    // Calculate pagination metadata
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;
    
    return NextResponse.json({
      data: listings || [],
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    console.error('Error in listings API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}

// Create a new listing
export async function POST(request: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.site_id) {
      return NextResponse.json(
        { error: 'Missing required fields: title, site_id' },
        { status: 400 }
      );
    }
    
    // Check if the site exists and is connected to the user
    const { data: siteConnection, error: siteError } = await supabase
      .from('connected_sites')
      .select('id')
      .eq('user_id', userId)
      .eq('site_id', body.site_id)
      .eq('is_active', true)
      .single();
    
    if (siteError || !siteConnection) {
      return NextResponse.json(
        { error: 'Site not connected or not found' },
        { status: 400 }
      );
    }
    
    // Create the listing
    const { data: listing, error: createError } = await supabase
      .from('listings')
      .insert({
        user_id: userId,
        site_id: body.site_id,
        title: body.title,
        description: body.description || '',
        price: body.price || 0,
        currency: body.currency || 'USD',
        status: body.status || 'draft',
        url: body.url || null,
        metadata: body.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating listing:', createError);
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'Listing created successfully',
      data: listing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the listing' },
      { status: 500 }
    );
  }
} 