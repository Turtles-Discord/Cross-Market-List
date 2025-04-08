# Subscription System Documentation

## Overview

The subscription system allows users to upgrade from the Free plan to the Pro plan, with different features and limitations. The system uses Stripe for payment processing and subscription management.

## Plans

The subscription plans are defined in `src/lib/constants.ts`:

- **Free Plan**:
  - 25 listing limit
  - Basic analytics
  - Manual sync 
  - Connect up to 2 sites

- **Pro Plan**:
  - Unlimited listings
  - Advanced analytics
  - Automatic sync
  - Priority support
  - Custom listing templates
  - Connect unlimited sites

## API Endpoints

### Check Subscription Status

**Endpoint**: `GET /api/subscriptions/status`

Returns the current user's subscription status, plan information, and listing usage.

**Response**:
```json
{
  "isPro": boolean,
  "planType": "free" | "pro",
  "listingsCount": number,
  "subscription": {
    "id": string,
    "status": string,
    "plan_type": string,
    "current_period_start": string,
    "current_period_end": string,
    // ...other subscription data
  } | null
}
```

### Create Checkout Session

**Endpoint**: `POST /api/subscriptions/create`

Creates a Stripe checkout session for upgrading to Pro.

**Request**:
```json
{
  "returnUrl": string (optional)
}
```

**Response**:
```json
{
  "sessionId": string,
  "url": string
}
```

### Create Customer Portal Session

**Endpoint**: `POST /api/subscriptions/portal`

Creates a Stripe customer portal session for managing existing subscriptions.

**Request**:
```json
{
  "returnUrl": string (optional)
}
```

**Response**:
```json
{
  "url": string
}
```

### Get Subscription Usage Data

**Endpoint**: `GET /api/subscriptions/usage`

Returns detailed information about the user's subscription usage.

**Response**:
```json
{
  "isPro": boolean,
  "planType": "free" | "pro",
  "totalListings": number,
  "listingLimit": number | null,
  "remainingListings": number | null,
  "listingsByPlatform": [
    {
      "platform_id": string,
      "platform_name": string,
      "count": number
    }
  ],
  "subscriptionStatus": string,
  "periodStart": string | null,
  "periodEnd": string | null,
  "daysRemaining": number | null
}
```

## Webhook Handler

**Endpoint**: `POST /api/webhooks/stripe`

Handles Stripe webhook events for subscription lifecycle management:

- `checkout.session.completed`: When a user completes the checkout process
- `customer.subscription.updated`: When a subscription is updated (e.g., plan changes, renewal)
- `customer.subscription.deleted`: When a subscription is canceled

## Components

### Subscription Page

Located at `src/app/subscription/page.tsx`, this page displays:
- Available subscription plans
- Feature comparison
- Current plan status
- Upgrade/manage buttons

### UpgradeButton

Located at `src/app/subscription/UpgradeButton.tsx`, this component:
- Creates a Stripe checkout session
- Redirects the user to Stripe's checkout page

### ManageSubscriptionButton

Located at `src/app/subscription/ManageSubscriptionButton.tsx`, this component:
- Creates a Stripe customer portal session
- Redirects the user to Stripe's customer portal

### SubscriptionUsage

Located at `src/components/dashboard/SubscriptionUsage.tsx`, this component:
- Displays current subscription status
- Shows listing usage with a progress bar
- Provides quick access to upgrade or manage subscription

## Implementation Flow

1. **Free User Flow**:
   - User views subscription page
   - Clicks "Upgrade to Pro"
   - Redirected to Stripe checkout
   - Completes payment
   - Webhook updates subscription in database
   - Redirected back to subscription page with success message

2. **Pro User Flow**:
   - User views subscription page
   - Clicks "Manage Subscription"
   - Redirected to Stripe Customer Portal
   - Can update payment method, cancel subscription, etc.
   - Webhook updates subscription in database
   - Redirected back to subscription page

## Subscription Checks

The application enforces subscription limits via the `checkListingLimit` function in `src/lib/db/utils.ts`. This is used before allowing users to create new listings to ensure they haven't exceeded their plan's limits.

## Setup Requirements

To set up the subscription system, you need:

1. A Stripe account
2. The following environment variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

3. Stripe CLI for local webhook testing:
   ```
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

## Database Schema

The subscription system relies on the following database tables:

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
``` 