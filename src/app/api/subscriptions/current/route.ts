import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default user object for when a new user is created
const defaultUser = {
  plan_type: 'free',
  subscription: null
};

/**
 * Fetches the current user's subscription details
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user information including plan type
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, plan_type, stripe_customer_id')
      .eq('id', userId)
      .single();
    
    // If user doesn't exist in Supabase yet, create them
    if (userError && userError.code === 'PGRST116') {
      // Get user data from Clerk
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Create user in Supabase
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          plan_type: 'free',
          listings_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to initialize user' },
          { status: 500 }
        );
      }
      
      user = newUser;
    } else if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user details' },
        { status: 500 }
      );
    }
    
    // Safety check - if we still don't have a user, return default
    if (!user) {
      return NextResponse.json(defaultUser);
    }
    
    // If the user has a pro plan, fetch their subscription details
    if (user.plan_type === 'pro' && user.stripe_customer_id) {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (!subError && subscription) {
        return NextResponse.json({
          plan_type: user.plan_type,
          subscription: {
            id: subscription.id,
            stripe_subscription_id: subscription.stripe_subscription_id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end
          }
        });
      }
    }
    
    // Return basic information if no subscription or user is on free plan
    return NextResponse.json({
      plan_type: user.plan_type || 'free',
      subscription: null
    });
    
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching subscription details' },
      { status: 500 }
    );
  }
} 