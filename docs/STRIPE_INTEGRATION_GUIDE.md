# Stripe Configuration for Full Integration

This document describes the environment variables needed for the complete Stripe integration.

## Required Environment Variables

Add these to your `.env` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe secret key from Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key

# Stripe Webhook Secret (for webhook signature verification)
STRIPE_WEBHOOK_SECRET=whsec_...  # Webhook endpoint secret from Stripe Dashboard
```

## Stripe Dashboard Setup

### 1. API Keys

- Go to Stripe Dashboard > Developers > API keys
- Copy your publishable key and secret key
- Use test keys for development (they start with `pk_test_` and `sk_test_`)

### 2. Webhook Configuration

- Go to Stripe Dashboard > Developers > Webhooks
- Create a new webhook endpoint pointing to: `https://your-domain.com/api/webhooks/stripe`
- Select the following events:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- Copy the webhook signing secret (starts with `whsec_`)

## Integration Features

### Payment Methods

- ✅ Secure card storage using Stripe Elements
- ✅ PCI-compliant tokenization (no raw card data stored)
- ✅ Multiple payment methods per customer
- ✅ Set default payment method
- ✅ Delete/detach payment methods

### Customer Management

- ✅ Automatic Stripe customer creation
- ✅ Customer ID stored in user profile
- ✅ Payment method attachment to customers

### Subscription Management

- ✅ Auto-renewal subscriptions
- ✅ Subscription status tracking
- ✅ Period management (start/end dates)
- ✅ Cancellation handling

### Payment Processing

- ✅ Real payment method creation (no mock data)
- ✅ Payment intent tracking
- ✅ Payment history with real transactions
- ✅ Failed payment handling

### Webhooks

- ✅ Payment success/failure notifications
- ✅ Subscription lifecycle events
- ✅ Automatic database sync with Stripe
- ✅ Invoice payment tracking

## Security Notes

- Never store raw credit card data
- All payment data is tokenized via Stripe
- PCI compliance handled by Stripe
- Webhook signatures verified for security
- Environment variables keep secrets secure

## Testing

Use Stripe's test card numbers:

- Success: `4242424242424242`
- Declined: `4000000000000002`
- Insufficient funds: `4000000000009995`

More test cards: https://stripe.com/docs/testing#cards
