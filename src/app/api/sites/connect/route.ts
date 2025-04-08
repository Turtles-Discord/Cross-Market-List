import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ConnectSiteRequestBody {
  siteId: string;
  credentials?: Record<string, string>;
}

export async function POST(request: Request) {
  try {
    // Authenticate the user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body: ConnectSiteRequestBody = await request.json();
    
    if (!body.siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      );
    }

    // Check if the site exists
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', body.siteId)
      .single();

    if (siteError || !site) {
      console.error('Error finding site:', siteError);
      return NextResponse.json(
        { error: 'Site not found' },
        { status: 404 }
      );
    }

    // Check if the user is already connected to this site
    const { data: existingConnection, error: connectionError } = await supabase
      .from('connected_sites')
      .select('*')
      .eq('user_id', userId)
      .eq('site_id', body.siteId)
      .single();

    // If there's an existing connection, update it instead of creating a new one
    if (existingConnection) {
      const { data: updatedConnection, error: updateError } = await supabase
        .from('connected_sites')
        .update({
          is_active: true,
          credentials: body.credentials || existingConnection.credentials,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConnection.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating connection:', updateError);
        return NextResponse.json(
          { error: 'Failed to update connection' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Connection updated successfully',
        siteId: body.siteId,
        connectionId: updatedConnection.id
      });
    }

    // Create a new connection
    const { data: newConnection, error: createError } = await supabase
      .from('connected_sites')
      .insert({
        user_id: userId,
        site_id: body.siteId,
        is_active: true,
        credentials: body.credentials || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating connection:', createError);
      return NextResponse.json(
        { error: 'Failed to create connection' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Connection created successfully',
      siteId: body.siteId,
      connectionId: newConnection.id
    });
  } catch (error) {
    console.error('Error in connect site API:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 