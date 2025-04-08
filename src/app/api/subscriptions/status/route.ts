import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserById, getUserSubscription, checkListingLimit } from '@/lib/db/utils';

export async function GET() {
  try {
    // Get the user ID from the session
    const { userId } = await auth();

    // If not authenticated, return unauthorized
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user from the database
    const { data: user, error: userError } = await getUserById(userId);
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the user's subscription
    const { data: subscription, error: subError } = await getUserSubscription(userId);

    // Count user's listings
    const listingsResult = await checkListingLimit(userId);
    const listingsCount = listingsResult.remaining !== undefined 
      ? (listingsResult.remaining >= 0 ? 25 - listingsResult.remaining : 0) 
      : 0;

    // Determine if the user has a Pro plan
    const isPro = subscription && 
                  subscription.status === 'active' && 
                  subscription.plan_type === 'pro';

    return NextResponse.json({
      isPro: !!isPro,
      planType: isPro ? 'pro' : 'free',
      listingsCount,
      subscription: subscription || null,
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve subscription status' },
      { status: 500 }
    );
  }
} 