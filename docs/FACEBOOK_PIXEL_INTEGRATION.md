# Facebook Pixel Integration Guide

## Overview

This document describes the complete Facebook Pixel integration implemented for the Qodwa platform. The integration includes automatic page view tracking, conversion tracking, and advanced event monitoring.

## Implementation Components

### 1. Facebook Pixel Utility (`/lib/facebook-pixel.ts`)

**Features:**

- TypeScript definitions for Facebook events
- Pixel initialization and script loading
- Event tracking functions
- Advanced user data tracking
- Conversion tracking helpers

**Key Functions:**

- `initFacebookPixel(pixelId)` - Initialize the pixel
- `trackFacebookEvent(eventName, parameters)` - Track standard events
- `trackPageView()` - Track page views
- `trackPurchase()` - Track completed purchases
- `trackRegistration()` - Track user registrations
- `trackSubscription()` - Track subscription events
- `trackInitiateCheckout()` - Track checkout initiation

### 2. Facebook Pixel Component (`/src/shared/components/facebook-pixel.tsx`)

**Features:**

- Next.js Script component integration
- Automatic pixel initialization
- Noscript fallback for tracking
- Environment-based conditional loading

### 3. Page View Tracking Hook (`/src/shared/hooks/use-facebook-pixel-page-view.tsx`)

**Features:**

- Automatic page view tracking on route changes
- Next.js router integration
- URL parameter tracking
- Component wrapper for easy integration

## Environment Configuration

### Required Environment Variable:

```env
NEXT_PUBLIC_FB_PIXEL_ID=715360224862527
```

### Next.js Configuration:

The pixel ID is exposed in `next.config.mjs`:

```javascript
env: {
  NEXT_PUBLIC_FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID,
}
```

## Integration Points

### 1. Global Integration (Layout)

**File:** `/src/app/[locale]/layout.tsx`

- Facebook Pixel component loaded globally
- Page view tracker integrated
- Runs on every page load

### 2. Registration Tracking

**File:** `/src/features/auth/components/register-form.tsx`

- Tracks `CompleteRegistration` event
- Triggered on successful user registration
- Includes registration method (email)

### 3. Checkout Tracking

**File:** `/src/features/subscriptions/components/stripe/Button.tsx`

- Tracks `InitiateCheckout` event
- Includes package value and name
- Triggered when user clicks checkout button

### 4. Purchase Tracking

**File:** `/src/app/[locale]/success/page.tsx`

- Tracks `Purchase` event with transaction details
- Tracks `Subscribe` event for subscriptions
- Includes value, currency, and transaction ID
- Triggered on payment success page

## Events Being Tracked

### Standard Events:

1. **PageView** - Automatic on every page load
2. **CompleteRegistration** - User registration completion
3. **InitiateCheckout** - Beginning of checkout process
4. **Purchase** - Completed payment
5. **Subscribe** - Subscription activation

### Event Parameters:

- **Value:** Transaction amount
- **Currency:** USD (default)
- **Content Name:** Package/product name
- **Content Type:** subscription/product type
- **External ID:** Transaction/session identifiers

## Advanced Features

### 1. User Data Tracking

The system supports enhanced matching with user data:

- Email addresses
- Phone numbers
- Names
- External user IDs

### 2. Error Handling

- Graceful fallbacks when pixel fails to load
- Console logging for debugging
- No impact on user experience if tracking fails

### 3. Development vs Production

- More permissive CORS in development
- Production-optimized configurations
- Environment-based pixel loading

## Testing & Verification

### 1. Facebook Events Manager

Monitor events in real-time at: https://business.facebook.com/events_manager

### 2. Browser Console

Enable debug logging to verify events:

```javascript
// Check if pixel is loaded
console.log('FB Pixel loaded:', !!window.fbq);

// Manual event tracking test
window.fbq('track', 'ViewContent', { content_name: 'test' });
```

### 3. Facebook Pixel Helper (Chrome Extension)

Install the Facebook Pixel Helper to verify pixel implementation and see events in real-time.

## Troubleshooting

### Common Issues:

1. **Pixel not loading:**
   - Verify `NEXT_PUBLIC_FB_PIXEL_ID` is set correctly
   - Check browser console for script loading errors
   - Ensure ad blockers aren't interfering

2. **Events not firing:**
   - Check if pixel is initialized before tracking events
   - Verify event parameters are correct
   - Check Facebook Events Manager for delayed reporting

3. **Development environment:**
   - Events may not appear immediately in Facebook
   - Use browser console logs to verify local tracking
   - Test with Facebook Pixel Helper extension

### Debug Commands:

```javascript
// Check pixel status
console.log('Facebook Pixel ID:', process.env.NEXT_PUBLIC_FB_PIXEL_ID);
console.log('Pixel loaded:', typeof window !== 'undefined' && !!window.fbq);

// Manual test events
trackPageView();
trackRegistration('email');
trackPurchase(50, 'USD', 'test123');
```

## Performance Considerations

1. **Async Loading:** Pixel script loads asynchronously
2. **No Blocking:** Tracking failures don't affect user experience
3. **Minimal Bundle Impact:** Utilities are only ~5KB
4. **Lazy Initialization:** Pixel only loads when needed

## Privacy & Compliance

1. **User Consent:** Consider implementing cookie consent for GDPR compliance
2. **Data Minimization:** Only track necessary business events
3. **User Privacy:** Respect user privacy settings and opt-outs
4. **Regional Compliance:** Ensure compliance with local data protection laws

## Future Enhancements

1. **Custom Audiences:** Implement custom audience building
2. **Advanced Matching:** Enhanced user data hashing
3. **Conversion API:** Server-side event tracking
4. **A/B Testing:** Event-based experiment tracking
