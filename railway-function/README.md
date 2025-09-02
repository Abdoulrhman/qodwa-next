# Railway Function: Subscription Renewal

This Railway Function handles automatic subscription renewal processing for the Qodwa education platform.

## Setup Instructions

### 1. Environment Variables

Set these environment variables in your Railway Function:

```bash
# Your Next.js application URL
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
# OR
APP_URL=https://your-app.vercel.app

# Security token for function authentication
RAILWAY_FUNCTION_SECRET=your_secure_random_string_here
```

### 2. Deployment

This function is designed to be deployed as a Railway Function. It will be automatically deployed when you push to your Railway project.

### 3. Cron Job Setup

Configure a cron job in Railway to call this function daily:

**URL:** `https://your-railway-function-url.railway.app`
**Method:** POST
**Headers:**

```
Authorization: Bearer your_secure_random_string_here
Content-Type: application/json
```

**Schedule:** `0 9 * * *` (Daily at 9:00 AM UTC)

### 4. Testing

You can test the function locally:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Test health check
curl https://your-railway-function-url.railway.app

# Test renewal process
curl -X POST https://your-railway-function-url.railway.app \
  -H "Authorization: Bearer your_secret" \
  -H "Content-Type: application/json"
```

## How It Works

1. **Daily Trigger**: Railway cron job calls this function daily
2. **Authentication**: Verifies the request using bearer token
3. **API Call**: Calls your Next.js app's renewal endpoint
4. **Processing**: Your app processes all due subscriptions
5. **Response**: Returns summary of renewal results
6. **Logging**: All activities are logged for monitoring

## Endpoints

- **GET /** - Health check endpoint
- **POST /** - Main renewal processing endpoint

## Security

- Bearer token authentication
- CORS enabled for cross-origin requests
- Error handling to prevent sensitive data exposure
- No sensitive data stored in this function

## Monitoring

The function provides:

- Health check status
- Processing results summary
- Error logging
- Timestamp tracking

## Error Handling

- Failed API calls are logged but don't cause function failure
- Returns 200 status even on errors to prevent Railway retries
- Comprehensive error messages for debugging

## Support

For issues or questions, check:

1. Railway Function logs
2. Your Next.js application logs
3. Stripe webhook delivery logs
4. Database connectivity
