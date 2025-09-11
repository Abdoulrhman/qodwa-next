# Subscription Auto-Renewal System

This document explains the automated subscription renewal system for the Qodwa platform.

## Overview

The system automatically processes subscription renewals using Stripe payments and GitHub Actions scheduling. It runs daily and handles payment processing, subscription updates, and failure management.

## Files Structure

```
scripts/
├── subscription-renewal-production.js  # Production renewal script
├── subscription-renewal-safe.js        # Safe testing script (no payments)
├── test-renewal-system.js              # System readiness test
└── README-auto-renewal.md               # This file

.github/workflows/
└── subscription-renewal.yml            # GitHub Actions workflow
```

## Scripts Explained

### 1. `subscription-renewal-production.js` ✅ PRODUCTION READY
- **Purpose**: Processes actual subscription renewals with Stripe payments
- **Features**:
  - Finds subscriptions due for renewal (7 days before expiry)
  - Processes Stripe payments automatically
  - Updates subscription end dates and billing cycles
  - Handles payment failures with retry logic (max 3 attempts)
  - Resets class counts for renewed subscriptions
  - Creates payment records for accounting

### 2. `subscription-renewal-safe.js` 🔍 TESTING ONLY
- **Purpose**: Tests system without processing payments
- **Features**:
  - Database connection testing
  - Subscription detection
  - Environment validation
  - Safe to run anytime

### 3. `test-renewal-system.js` 🧪 SYSTEM CHECK
- **Purpose**: Comprehensive system readiness assessment
- **Features**:
  - Database connectivity test
  - Auto-renewal subscription detection
  - Payment method validation
  - Stripe connection test
  - Environment variable check
  - Readiness recommendations

## How It Works

### Renewal Process Flow

1. **Daily Trigger**: GitHub Actions runs at 9:00 AM UTC daily
2. **Eligibility Check**: Finds subscriptions with `auto_renew: true` and `next_billing_date <= tomorrow`
3. **Payment Processing**: Uses Stripe to charge the default payment method
4. **Success Handling**: 
   - Updates subscription end date
   - Sets next billing date
   - Resets class count
   - Creates payment record
5. **Failure Handling**:
   - Increments retry counter
   - Logs failure reason
   - Cancels after 3 failed attempts

### Database Schema Requirements

The system uses these Prisma model fields:

```prisma
model Subscription {
  // Core fields
  status            SubscriptionStatus @default(ACTIVE)
  auto_renew        Boolean  @default(false)
  endDate           DateTime?
  
  // Auto-renewal specific
  next_billing_date     DateTime?
  auto_renew_attempts   Int      @default(0)
  last_renewal_attempt  DateTime?
  renewal_failure_reason String?
  
  // Stripe integration
  stripeSubscriptionId String?
}

model User {
  // Payment integration
  stripeCustomerId      String?
  defaultPaymentMethodId String?
}
```

## Environment Variables

Required environment variables for production:

```bash
# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_live_...

# Next.js Auth
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-domain.com

# App URL for Stripe redirects
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## GitHub Actions Setup

The workflow is configured in `.github/workflows/subscription-renewal.yml`:

```yaml
name: Subscription Renewal
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:       # Manual trigger for testing
```

## Usage Instructions

### 1. Test the System First

```bash
# Test system readiness
npm run test:renewal

# Run safe test (no payments)
npm run renewal:safe
```

### 2. Enable Auto-Renewal for Subscriptions

Update subscriptions to enable auto-renewal:

```javascript
await prisma.subscription.update({
  where: { id: subscriptionId },
  data: {
    auto_renew: true,
    next_billing_date: new Date('2024-12-01') // 7 days before expiry
  }
});
```

### 3. Production Deployment

1. **Set GitHub Secrets**: Add all required environment variables
2. **Test Workflow**: Use "workflow_dispatch" to test manually
3. **Monitor Logs**: Check GitHub Actions logs for success/failures
4. **Enable Daily**: The cron schedule will run automatically

### 4. Manual Renewal

```bash
# Run production renewal manually
npm run renewal

# Test renewal logic (development)
npm run renewal:test
```

## Monitoring & Troubleshooting

### Success Indicators
- ✅ Subscriptions automatically renewed
- ✅ Payment records created
- ✅ End dates updated
- ✅ Class counts reset

### Failure Scenarios
- ❌ Invalid payment method → Retry up to 3 times
- ❌ Insufficient funds → Retry up to 3 times  
- ❌ Stripe API errors → Logged for investigation
- ❌ Database errors → Workflow fails, creates GitHub issue

### Logs Location
- **GitHub Actions**: Repository → Actions → Subscription Renewal
- **Manual Runs**: Terminal output with detailed status

## Safety Features

1. **Rate Limiting**: 1-second delay between renewals
2. **Batch Limiting**: Max 50 subscriptions per run
3. **Retry Logic**: Max 3 attempts before cancellation
4. **Error Handling**: Comprehensive try-catch blocks
5. **Logging**: Detailed success/failure tracking

## Production Checklist

Before enabling production auto-renewal:

- [ ] ✅ Database schema updated with auto-renewal fields
- [ ] ✅ Stripe integration configured
- [ ] ✅ Environment variables set in GitHub Secrets
- [ ] ✅ Test script passes all checks (`npm run test:renewal`)
- [ ] ✅ Safe script runs without errors (`npm run renewal:safe`)
- [ ] ✅ Manual workflow dispatch tested successfully
- [ ] ✅ Payment failure handling tested
- [ ] ✅ Monitoring and alerting configured

## Current Status

- ✅ **Production Script**: Ready for deployment
- ✅ **Database Schema**: All required fields present
- ✅ **GitHub Workflow**: Configured and updated
- ✅ **Testing Tools**: Available for validation
- ✅ **Error Handling**: Comprehensive failure management
- ✅ **Documentation**: Complete setup guide

The system is **production-ready** and can be enabled by running the test script first, then enabling the GitHub Actions workflow.
