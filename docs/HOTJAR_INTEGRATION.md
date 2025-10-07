# Hotjar Integration Documentation

This document explains how to use the Hotjar integration in your Next.js application.

## Setup

1. **Environment Variable**: Add your Hotjar Site ID to your environment file:
   ```bash
   # In your .env.local file
   NEXT_PUBLIC_HOTJAR_ID="6539955"
   ```

2. **Automatic Integration**: Hotjar is automatically loaded in the root layout (`src/app/layout.tsx`) for all pages.

## Available Functions

### Import the functions
```typescript
import {
  trackHotjarEvent,
  identifyHotjarUser,
  triggerHotjarPoll,
  trackHotjarVirtualPageView,
  tagHotjarRecording,
  isHotjarLoaded,
  getHotjarConfig
} from '@/lib/hotjar';
```

### Track Custom Events
```typescript
// Track button clicks
trackHotjarEvent('button_click', {
  button_name: 'signup',
  page: 'homepage'
});

// Track form submissions
trackHotjarEvent('form_submit', {
  form_type: 'contact',
  user_type: 'student'
});

// Track purchase events
trackHotjarEvent('purchase_completed', {
  package_id: 'premium',
  value: 99.99,
  currency: 'USD'
});
```

### Identify Users
```typescript
// After user logs in
identifyHotjarUser({
  userId: 'user123',
  email: 'user@example.com',
  name: 'John Doe',
  subscription: 'premium',
  registrationDate: '2024-01-15'
});
```

### Tag Recordings
```typescript
// Tag recordings for easier filtering
tagHotjarRecording(['error', 'payment-issue']);
tagHotjarRecording(['conversion', 'premium-signup']);
```

### Virtual Page Views (for SPAs)
```typescript
// Track virtual page views for dynamic content
trackHotjarVirtualPageView('/dashboard/virtual-page');
```

### Trigger Polls/Surveys
```typescript
// Trigger specific polls or surveys
triggerHotjarPoll('poll-123');
```

### Check if Hotjar is Loaded
```typescript
if (isHotjarLoaded()) {
  // Hotjar is ready to use
  trackHotjarEvent('page_ready');
}
```

## Usage Examples in Components

### Button Click Tracking
```tsx
'use client';

import { trackHotjarEvent } from '@/lib/hotjar';

export function SignupButton() {
  const handleClick = () => {
    trackHotjarEvent('signup_button_click', {
      location: 'header',
      page: window.location.pathname
    });
    
    // Your signup logic here
  };

  return (
    <button onClick={handleClick}>
      Sign Up
    </button>
  );
}
```

### Form Submission Tracking
```tsx
'use client';

import { trackHotjarEvent, tagHotjarRecording } from '@/lib/hotjar';

export function ContactForm() {
  const handleSubmit = async (formData: FormData) => {
    try {
      // Submit form
      await submitForm(formData);
      
      trackHotjarEvent('contact_form_success', {
        form_type: 'contact',
        fields_filled: Object.keys(formData).length
      });
      
    } catch (error) {
      trackHotjarEvent('contact_form_error', {
        error_type: 'submission_failed'
      });
      
      tagHotjarRecording(['form-error', 'contact']);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
    </form>
  );
}
```

### User Authentication Tracking
```tsx
'use client';

import { identifyHotjarUser, trackHotjarEvent } from '@/lib/hotjar';

export function AuthHandler() {
  const handleLogin = async (user: User) => {
    // Identify the user for Hotjar
    identifyHotjarUser({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      subscription: user.subscription
    });

    trackHotjarEvent('user_login', {
      method: 'email',
      user_type: user.role
    });
  };

  const handleLogout = () => {
    trackHotjarEvent('user_logout');
  };

  return (
    // Your auth UI
    <div>...</div>
  );
}
```

### E-commerce Tracking
```tsx
'use client';

import { trackHotjarEvent, tagHotjarRecording } from '@/lib/hotjar';

export function CheckoutProcess() {
  const trackPurchase = (orderData: Order) => {
    trackHotjarEvent('purchase_completed', {
      order_id: orderData.id,
      value: orderData.total,
      currency: orderData.currency,
      items: orderData.items.length,
      payment_method: orderData.paymentMethod
    });

    tagHotjarRecording(['conversion', `package-${orderData.packageType}`]);
  };

  const trackAbandonedCart = () => {
    trackHotjarEvent('cart_abandoned', {
      items_count: cartItems.length,
      cart_value: totalValue
    });

    tagHotjarRecording(['abandoned-cart']);
  };

  return (
    // Your checkout UI
    <div>...</div>
  );
}
```

## Environment Variables

Make sure to set up your environment variables:

```bash
# .env.local (for local development)
NEXT_PUBLIC_HOTJAR_ID="6539955"

# .env.production (for production)
NEXT_PUBLIC_HOTJAR_ID="6539955"
```

## TypeScript Support

The integration includes full TypeScript support with proper type definitions for all functions and parameters.

## Privacy Considerations

- Hotjar only loads when a valid Site ID is provided
- All tracking functions safely handle cases where Hotjar isn't loaded
- Consider GDPR compliance and user consent when implementing tracking
- Use environment variables to disable tracking in development if needed

## Debugging

- All Hotjar functions include console logging in development
- Use `getHotjarConfig()` to check the current configuration
- Use `isHotjarLoaded()` to verify Hotjar is properly initialized
- Check the browser's network tab to verify Hotjar scripts are loading

## Best Practices

1. **Event Naming**: Use consistent, descriptive event names
2. **Data Structure**: Keep event data structured and meaningful
3. **User Privacy**: Always respect user privacy and consent preferences
4. **Performance**: Hotjar loads asynchronously and won't block your app
5. **Error Handling**: All functions include error handling and won't crash your app