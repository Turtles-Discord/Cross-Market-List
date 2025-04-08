import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * API endpoint to cancel a user's subscription
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user's subscription from our database
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, stripe_subscription_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (subError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }
    
    const stripeSubscriptionId = subscription.stripe_subscription_id;
    if (!stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }
    
    // Cancel the subscription at the end of the current billing period
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true
    });
    
    // Update our database to reflect the cancellation
    await supabase
      .from('subscriptions')
      .update({
        status: 'canceling',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);
    
    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period'
    });
    
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
} 