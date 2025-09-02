# Railway Auto-Renewal Setup Guide

## Railway Function Configuration

### 1. Deploy Railway Function
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create a new Railway function (if not using existing project)
railway new

# Deploy the function
railway up
```

### 2. Set Environment Variables in Railway
```bash
# Database connection
DATABASE_URL=your_postgres_connection_string

# Stripe configuration
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...

# Railway function security
RAILWAY_FUNCTION_SECRET=your_secure_random_string

# Next.js app URL
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

### 3. Create Cron Job in Railway
Railway supports cron jobs that can call your API endpoints.

Create a cron job that calls:
```
POST https://your-app.vercel.app/api/railway/subscription-renewal
Authorization: Bearer your_secure_random_string
```

Recommended schedule: Daily at 9:00 AM UTC
Cron expression: `0 9 * * *`

### 4. Set up Webhook Endpoints in Stripe Dashboard

Add these webhook endpoints to your Stripe dashboard:

**Endpoint URL:** `https://your-app.vercel.app/api/webhooks/stripe`

**Events to listen for:**
- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `setup_intent.succeeded`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### 5. Testing the Auto-Renewal System

#### Test with Stripe Test Cards
```javascript
// Use these test card numbers in Stripe test mode:
// Successful payment: 4242424242424242
// Failed payment: 4000000000000002
// Requires authentication: 4000002500003155
```

#### Test the Railway Function Manually
```bash
curl -X POST https://your-app.vercel.app/api/railway/subscription-renewal \
  -H "Authorization: Bearer your_secure_random_string" \
  -H "Content-Type: application/json"
```

#### Check Function Status
```bash
curl https://your-app.vercel.app/api/railway/subscription-renewal
```

### 6. Monitoring and Alerts

The system includes:
- **Health checks** via GET endpoint
- **Email notifications** for failed renewals (customize as needed)
- **Comprehensive logging** for debugging
- **Retry logic** with maximum 3 attempts per subscription

### 7. Security Best Practices

1. **Use strong webhook secrets** for Stripe
2. **Rotate Railway function secrets** regularly
3. **Monitor failed payment attempts** and investigate patterns
4. **Set up alerts** for high failure rates
5. **Use HTTPS only** for all communications

### 8. Subscription Lifecycle

```
User subscribes with auto-renewal enabled
    ↓
Payment method saved securely to Stripe
    ↓
Next billing date calculated and stored
    ↓
Railway cron job runs daily
    ↓
Checks for subscriptions due for renewal
    ↓
Processes payment using saved payment method
    ↓
Updates subscription status and next billing date
    ↓
Sends notifications for failures
```

### 9. Error Handling

The system handles:
- **Payment failures** (card declined, expired, etc.)
- **Network issues** with retry logic
- **Invalid payment methods** with user notifications
- **Database connectivity** issues
- **Stripe API rate limits**

### 10. User Experience Features

- **Payment method management** UI
- **Auto-renewal toggle** per subscription
- **Email notifications** for renewal success/failure
- **Grace period** for failed payments
- **Easy subscription cancellation**

## Implementation Checklist

- [ ] Database schema updated with new fields
- [ ] Stripe integration configured
- [ ] Railway function deployed
- [ ] Cron job scheduled
- [ ] Webhook endpoints configured
- [ ] Test payments verified
- [ ] Monitoring set up
- [ ] User interface implemented
- [ ] Email notifications configured
- [ ] Security measures in place
