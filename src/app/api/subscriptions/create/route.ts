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

// Subscription plan details
const SUBSCRIPTION_PLANS = {
  PRO: {
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited listings',
      'Connect unlimited sites',
      'Automatic daily sync',
      'Priority support',
      'Advanced analytics'
    ],
    stripeProductId: 'prod_listing_aggregator_pro'
  }
};

/**
 * API endpoint to create a Stripe checkout session for subscription
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user information
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, stripe_customer_id, plan_type')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user details' },
        { status: 500 }
      );
    }
    
    // If user is already on Pro plan, return early
    if (user.plan_type === 'pro') {
      return NextResponse.json({
        message: 'You are already subscribed to the Pro plan',
        alreadySubscribed: true
      });
    }
    
    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    
    if (!customerId) {
      // Create a new customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId,
        }
      });
      
      customerId = customer.id;
      
      // Save the customer ID to the user record
      await supabase
        .from('users')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }
    
    // Create the checkout session
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`;
    
    // Get the app's domain for the webhook
    const appDomain = new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').host;
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: SUBSCRIPTION_PLANS.PRO.name,
              description: 'Unlimited listings across all your platforms',
            },
            unit_amount: Math.round(SUBSCRIPTION_PLANS.PRO.price * 100), // Convert to cents
            recurring: {
              interval: SUBSCRIPTION_PLANS.PRO.interval as 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
    });
    
    // Return the session URL to redirect the user to Stripe Checkout
    return NextResponse.json({ url: session.url });
    
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Error creating subscription' },
      { status: 500 }
    );
  }
} 