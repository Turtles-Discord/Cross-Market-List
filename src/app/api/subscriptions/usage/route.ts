import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = await auth();
    const clerkUser = await currentUser();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
      
    // Create user if not exists
    if (checkError && checkError.code === 'PGRST116') {
      console.log('Creating new user in Supabase:', userId);
      
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress || '';
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          plan_type: 'free',
          listings_count: 0
        });
        
      if (insertError) {
        console.error('Error creating user:', insertError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      
      // Return default values for new user
      return NextResponse.json({
        plan: 'free',
        usage: 0,
        limit: 25,
        percentage: 0
      });
    }
    
    // Now try to get user data
    const { data: userData, error } = await supabase
      .from('users')
      .select('plan_type, listings_count')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
    }

    // Calculate usage
    const listingLimit = userData.plan_type === 'free' ? 25 : Infinity;
    const percentage = userData.plan_type === 'free' 
      ? Math.min(100, Math.round((userData.listings_count / listingLimit) * 100))
      : 0;

    return NextResponse.json({
      plan: userData.plan_type,
      usage: userData.listings_count,
      limit: userData.plan_type === 'free' ? 25 : 'unlimited',
      percentage
    });
  } catch (error) {
    console.error('Error fetching usage data:', error);
    return NextResponse.json({ error: 'Failed to fetch usage data' }, { status: 500 });
  }
} 