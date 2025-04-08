# Subscription System Testing Guide

This guide helps you test the Stripe subscription integration during development.

## Prerequisites

Before you start testing, make sure you have:

1. Set up a Stripe account and configured the necessary environment variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

2. Installed the Stripe CLI for local webhook testing.

## Local Testing Setup

### 1. Start the Stripe webhook listener

Run the following command to forward Stripe webhook events to your local development server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret. Copy this and add it to your `.env.local` file as `STRIPE_WEBHOOK_SECRET`.

### 2. Create test products and prices in Stripe

You can create test products and prices in the Stripe Dashboard or using the Stripe CLI:

```bash
# Create a product
stripe products create --name="CrossMarketList Pro" --description="Unlimited listings and premium features"

# Create a price (recurring subscription)
stripe prices create --product="CrossMarketList Pro" --unit-amount=1999 --currency=usd --recurring[interval]=month
```

Make note of the price ID returned, which you can use for testing.

## Testing the Subscription Flow

### 1. Verify Configuration

Visit the test endpoint to check if your Stripe integration is properly configured:

```
GET /api/test/subscription
```

This endpoint returns information about your current subscription status and confirms that all required environment variables are set.

### 2. Test Checkout Flow

1. Navigate to the subscription page:
   ```
   /subscription
   ```

2. Click the "Upgrade to Pro" button to start the checkout process.

3. Use one of the Stripe test card numbers:
   - `4242 4242 4242 4242` - Successful payment
   - `4000 0027 6000 3184` - Requires authentication
   - `4000 0000 0000 0341` - Payment fails

4. Complete the checkout process.

5. You should be redirected back to the app with a success message.

### 3. Verify Webhook Event Handling

When a checkout session completes, Stripe sends a `checkout.session.completed` event:

1. Check your terminal running the Stripe CLI to see the event.
2. Verify the API logs show proper handling of the event.
3. Check the database to confirm the subscription was created:

```bash
# In your database admin panel or query tool
SELECT * FROM subscriptions WHERE user_id = 'your_user_id';
```

### 4. Test Customer Portal

1. After subscribing, go to the subscription page.
2. Click "Manage Subscription" to access the Stripe Customer Portal.
3. Try updating the payment method.
4. Try canceling the subscription.

### 5. Test Subscription Updates

When a subscription is updated, Stripe sends a `customer.subscription.updated` event:

1. Make a change in the Stripe Customer Portal.
2. Check your terminal for the event.
3. Verify the database reflects the changes:

```bash
# Check the updated subscription
SELECT * FROM subscriptions WHERE user_id = 'your_user_id';

# Check if the user's plan type was updated
SELECT plan_type FROM users WHERE id = 'your_user_id';
```

### 6. Test Subscription Cancellation

When a subscription is canceled, Stripe sends a `customer.subscription.deleted` event:

1. Cancel the subscription in the Customer Portal.
2. Check your terminal for the event.
3. Verify the database reflects the cancellation:

```bash
# The subscription should be removed or marked as canceled
SELECT * FROM subscriptions WHERE user_id = 'your_user_id';

# The user should be downgraded to the free plan
SELECT plan_type FROM users WHERE id = 'your_user_id';
```

## Troubleshooting

### Webhook Events Not Processing

If webhook events aren't being processed:

1. Check if the webhook listener is running.
2. Verify the `STRIPE_WEBHOOK_SECRET` in your `.env.local` file matches the one from the Stripe CLI.
3. Check the API logs for any errors during webhook processing.

### Payment Fails

If payments are failing:

1. Check the Stripe Dashboard for error messages.
2. Verify you're using a valid test card number.
3. Ensure your product and price IDs are correctly configured.

### Subscription Not Updated in Database

If the database isn't updating:

1. Check the API logs for errors.
2. Verify the webhook events are being received.
3. Confirm the database queries in the webhook handler are working correctly.

## Testing with Real Money

**Never use real payment methods during development.**

When you're ready to test with real money:

1. Switch your Stripe account from test mode to live mode.
2. Update your environment variables with the live API keys.
3. Only test with small amounts (e.g., $1) until you're confident everything works.

## Additional Resources

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Stripe Customer Portal Documentation](https://stripe.com/docs/billing/subscriptions/customer-portal) 