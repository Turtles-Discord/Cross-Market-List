import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserById, getUserSubscription } from '@/lib/db/utils';
import { createCustomerPortalSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Check if user is authenticated
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: user, error: userError } = await getUserById(userId);
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's subscription to check for Stripe customer ID
    const { data: subscription, error: subError } = await getUserSubscription(userId);
    
    // Get Stripe customer ID from user or subscription
    const stripeCustomerId = user.stripe_customer_id || 
                            (subscription ? subscription.stripe_customer_id : null);

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer ID found for user' },
        { status: 400 }
      );
    }

    // Get the return URL from the request, if provided
    const body = await req.json();
    const { returnUrl } = body;

    // Create a portal session for the customer
    const session = await createCustomerPortalSession({
      customerId: stripeCustomerId,
      returnUrl
    });

    return NextResponse.json({
      url: session.url
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
} 