# Automatic Subscription Renewal System

This system handles automatic subscription renewals using GitHub Actions instead of server-side cron jobs, providing better reliability and monitoring.

## Architecture

- **GitHub Actions Workflow**: Runs daily at 9 AM UTC
- **Node.js Script**: Processes subscription renewals via Stripe API
- **Database Integration**: Updates subscription status and payment records
- **Error Handling**: Creates GitHub issues for failed renewals

## Setup Instructions

### 1. Configure GitHub Repository Secrets

Add the following secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

```
DATABASE_URL - PostgreSQL connection string
STRIPE_SECRET_KEY - Stripe secret API key
NEXTAUTH_SECRET - NextAuth secret for session handling
NEXTAUTH_URL - Your application URL
```

### 2. Enable Database Schema Changes

Uncomment the auto-renewal fields in `prisma/schema.prisma`:

```prisma
// In User model:
stripeCustomerId      String?               // Stripe customer ID
defaultPaymentMethodId String?              // Default payment method ID

// In Subscription model:
stripe_subscription_id String?              // Stripe subscription ID
next_billing_date     DateTime?             // Next billing date
billing_cycle_anchor  DateTime?             // Billing cycle anchor
auto_renew_attempts   Int      @default(0) // Failed renewal attempts
last_renewal_attempt  DateTime?             // Last renewal timestamp
renewal_failure_reason String?              // Failure reason

// Uncomment PaymentMethod and PaymentIntent models
```

### 3. Apply Database Migration

```bash
# Create and apply migration
npx prisma migrate dev --name add_auto_renewal_support

# Or push changes directly (for development)
npx prisma db push
```

### 4. Test Locally

```bash
# Test the setup
node scripts/test-renewal-setup.js

# Test renewal process (dry run)
yarn renewal:test
```

### 5. Deploy and Monitor

- Push changes to trigger GitHub Actions
- Monitor workflow runs in the Actions tab
- Check for any created issues if failures occur

## Workflow Details

### Schedule
- **Frequency**: Daily at 9:00 AM UTC
- **Trigger**: GitHub Actions cron schedule
- **Manual**: Can be triggered manually via workflow_dispatch

### Process Flow

1. **Find Due Subscriptions**
   - Query active subscriptions with `auto_renew: true`
   - Filter by `next_billing_date <= today`

2. **Process Each Subscription**
   - Validate user has payment method configured
   - Create Stripe payment intent with stored payment method
   - Update subscription with new billing date
   - Record payment intent in database

3. **Handle Failures**
   - Increment `auto_renew_attempts` counter
   - Store failure reason
   - Disable auto-renewal after 3 failed attempts
   - Create GitHub issue for monitoring

### Error Handling

- **Payment Failures**: Logged and retried up to 3 times
- **System Errors**: Create GitHub issues for immediate attention
- **Missing Configuration**: Validation prevents execution

## Monitoring and Alerts

### GitHub Issues
Failed renewals automatically create GitHub issues with:
- Subscription details
- Error information
- Timestamp and context

### Logs
All workflow runs are logged in GitHub Actions with:
- Processing summary
- Individual subscription results
- Error details and stack traces

## Security Features

- **No Sensitive Data Storage**: Only Stripe IDs are stored
- **Secure API Calls**: Direct Stripe API integration
- **Environment Variables**: All secrets managed via GitHub
- **Audit Trail**: Complete payment history in database

## Maintenance

### Regular Tasks
- Monitor GitHub Actions workflow runs
- Review and close resolved GitHub issues
- Update billing dates for plan changes
- Verify Stripe webhook configurations

### Troubleshooting
- Check GitHub repository secrets configuration
- Verify database connectivity from Actions environment
- Validate Stripe API key permissions
- Review Prisma schema changes

## Testing

### Local Testing
```bash
# Test database connection and setup
node scripts/test-renewal-setup.js

# Test renewal logic (requires test data)
NODE_ENV=development node scripts/subscription-renewal.js
```

### Production Testing
- Use workflow_dispatch to manually trigger
- Monitor first few runs carefully
- Verify billing dates and payment records
- Check Stripe dashboard for payment confirmations
