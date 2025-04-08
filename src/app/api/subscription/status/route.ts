import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserById, getUserSubscription } from '@/lib/db/utils';
import { AppError } from '@/lib/errors';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user plan and listing count
    const { data: user, error: userError } = await getUserById(userId);
    
    if (userError || !user) {
      console.error('Error fetching user data:', userError);
      throw new AppError('Error fetching user data', 500);
    }
    
    // Get subscription details
    const { data: subscription, error: subscriptionError } = await getUserSubscription(userId);
    
    // Determine if the user is on a pro plan
    const isPro = user.plan_type === 'pro';
    
    return NextResponse.json({
      isPro,
      planType: user.plan_type,
      listingsCount: user.listings_count,
      subscription: subscription || null,
      // Additional fields that might be useful
      subscriptionStatus: subscription?.status || null,
      currentPeriodEnd: subscription?.current_period_end || null,
    });
  } catch (error) {
    console.error('Error in subscription status API:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 