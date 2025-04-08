import Stripe from 'stripe';
import { SUBSCRIPTION_PLANS } from './constants';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is missing');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
});

/**
 * Creates a Stripe checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  email,
  customerId,
  priceId,
  returnUrl,
}: {
  userId: string;
  email: string;
  customerId?: string;
  priceId: string;
  returnUrl: string;
}) {
  // Default return URL if none provided
  if (!returnUrl) {
    returnUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  // If existing customer ID is provided, use that
  // Otherwise create a new customer
  let stripeCustomerId = customerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      metadata: { userId },
      email,
    });
    stripeCustomerId = customer.id;
  }

  // Create the checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    subscription_data: {
      metadata: {
        userId,
      },
    },
    success_url: `${returnUrl}/subscription?success=true`,
    cancel_url: `${returnUrl}/subscription?canceled=true`,
    metadata: {
      userId,
    },
  });

  return { sessionId: session.id, customerId: stripeCustomerId };
}

/**
 * Creates a Stripe customer portal session
 */
export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl?: string;
}) {
  if (!customerId) {
    throw new Error('Customer ID is required');
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const defaultReturnUrl = `${baseUrl}/subscription`;

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || defaultReturnUrl,
  });

  return session;
}

/**
 * Gets a Stripe customer by ID
 */
export async function getStripeCustomer(customerId: string) {
  return await stripe.customers.retrieve(customerId);
}

/**
 * Gets a subscription by ID
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancels a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Formats currency amount from cents to dollars
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
} 