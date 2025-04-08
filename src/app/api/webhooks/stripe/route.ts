import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Initialize Stripe with no specific version to use the latest
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Disable body parsing, needed for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Stripe webhook handler
 * Processes Stripe events for subscriptions and payments
 * Documentation: https://stripe.com/docs/webhooks
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: any;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Extract the object from the event
  const dataObject: any = event.data.object;

  try {
    // Handle the event based on its type
    switch (event.type) {
      case 'checkout.session.completed': {
        // Payment was successful, activate subscription
        const session = dataObject;
        
        // Get metadata from the session
        const userId = session.metadata?.userId;
        if (!userId) {
          throw new Error('No user ID in session metadata');
        }
        
        // Get subscription ID from the session
        const subscriptionId = session.subscription;
        if (!subscriptionId) {
          throw new Error('No subscription ID in session');
        }
        
        // Get customer ID from the session
        const customerId = session.customer;
        if (!customerId) {
          throw new Error('No customer ID in session');
        }
        
        console.log(`Processing completed checkout for user ${userId}, subscription ${subscriptionId}`);
        
        // Create subscription record in database
        const { error: subError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_type: 'pro',
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: null, // Will be updated when we get more details
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (subError) {
          throw new Error(`Failed to create subscription record: ${subError.message}`);
        }
        
        // Update user plan
        const { error: userError } = await supabase
          .from('users')
          .update({
            plan_type: 'pro',
            stripe_customer_id: customerId,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (userError) {
          throw new Error(`Failed to update user plan: ${userError.message}`);
        }
        
        console.log(`Successfully activated pro subscription for user ${userId}`);
        break;
      }
      
      case 'customer.subscription.updated': {
        // Subscription was updated
        const subscription = dataObject;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        
        console.log(`Processing subscription update for ${subscriptionId}, status: ${status}`);
        
        // Find the subscription in our database
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
        
        if (subError) {
          throw new Error(`Subscription not found: ${subError.message}`);
        }
        
        const userId = subData.user_id;
        
        // Update the subscription status
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        if (updateError) {
          throw new Error(`Failed to update subscription: ${updateError.message}`);
        }
        
        console.log(`Updated subscription status to ${status} for user ${userId}`);
        break;
      }
      
      case 'customer.subscription.deleted': {
        // Subscription was canceled or expired
        const subscription = dataObject;
        const subscriptionId = subscription.id;
        
        console.log(`Processing subscription deletion for ${subscriptionId}`);
        
        // Find the subscription in our database
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();
        
        if (subError) {
          throw new Error(`Subscription not found: ${subError.message}`);
        }
        
        const userId = subData.user_id;
        
        // Update the subscription status
        const { error: updateSubError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionId);
        
        if (updateSubError) {
          throw new Error(`Failed to update subscription: ${updateSubError.message}`);
        }
        
        // Downgrade user to free plan
        const { error: updateUserError } = await supabase
          .from('users')
          .update({
            plan_type: 'free',
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        if (updateUserError) {
          throw new Error(`Failed to update user plan: ${updateUserError.message}`);
        }
        
        console.log(`Subscription canceled and user ${userId} downgraded to free plan`);
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Error processing webhook: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    );
  }
} 