export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleApiError(error: unknown) {
  console.error('API error:', error);
  
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.statusCode });
  }
  
  return Response.json(
    { error: 'An unexpected error occurred' }, 
    { status: 500 }
  );
}

export function checkListingLimits(
  planType: string, 
  listingsCount: number
) {
  if (
    planType === 'free' && 
    listingsCount >= SUBSCRIPTION_PLANS.FREE.listingLimit
  ) {
    return {
      canCreate: false,
      message: `You've reached the limit of ${SUBSCRIPTION_PLANS.FREE.listingLimit} listings on the Free plan. Upgrade to Pro for unlimited listings.`
    };
  }
  
  return { canCreate: true };
}

// Import constant to fix error
import { SUBSCRIPTION_PLANS } from './constants'; 