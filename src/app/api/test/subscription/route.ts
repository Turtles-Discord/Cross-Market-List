/**
 * This is a test endpoint to verify that the Stripe subscription system works correctly.
 * DO NOT USE IN PRODUCTION - this is for development purposes only.
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createCustomerPortalSession, stripe } from '@/lib/stripe';
import { 
  getUserById, 
  updateUserSubscription, 
  getUserSubscription, 
  getTotalListingsByPlatform,
  checkListingLimit 
} from '@/lib/db/utils';
import { SUBSCRIPTION_PLANS } from '@/lib/constants';

export async function GET() {
  try {
    // Ensure this is not used in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This test endpoint is not available in production' },
        { status: 403 }
      );
    }

    // Get the authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data
    const { data: user, error: userError } = await getUserById(userId);
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's subscription status
    const { data: subscription } = await getUserSubscription(userId);
    
    // Check listing limits
    const listingLimit = await checkListingLimit(userId);
    
    // Get listings by platform
    const { data: listingsByPlatform } = await getTotalListingsByPlatform(userId);

    // Build a test report
    const report = {
      user: {
        id: user.id,
        email: user.email,
        planType: user.plan_type,
      },
      subscription: subscription || null,
      listingLimit: {
        canCreate: listingLimit.canCreate,
        remaining: listingLimit.remaining || 0,
        message: listingLimit.message,
      },
      usage: {
        listingsByPlatform: listingsByPlatform || [],
        totalListings: listingsByPlatform?.reduce((sum: number, item: any) => sum + item.count, 0) || 0,
      },
      testSetup: {
        stripeSetUp: !!process.env.STRIPE_SECRET_KEY,
        webHookSetup: !!process.env.STRIPE_WEBHOOK_SECRET,
        publishableKeySetUp: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      }
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error running subscription test:', error);
    return NextResponse.json(
      { error: 'Subscription test failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 