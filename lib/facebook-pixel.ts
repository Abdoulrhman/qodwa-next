// Facebook Pixel TypeScript definitions
declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

// Facebook Pixel event types
export type FacebookEventName =
  | 'PageView'
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Subscribe'
  | 'StartTrial'
  | 'AddPaymentInfo'
  | 'AddToWishlist'
  | 'Search'
  | 'Contact';

export interface FacebookEventParams {
  content_type?: string;
  content_ids?: string[];
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
  predicted_ltv?: number;
  num_items?: number;
  status?: string;
  search_string?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  external_id?: string;
  subscription_id?: string;
  fb_login_id?: string;
  lead_event_source?: string;
}

// Initialize Facebook Pixel
export const initFacebookPixel = (pixelId: string): void => {
  if (typeof window === 'undefined' || !pixelId) return;

  // Check if already initialized
  if (window.fbq) return;

  // Initialize fbq function
  const fbq: any = function (...args: any[]) {
    if (fbq.callMethod) {
      fbq.callMethod.apply(fbq, args);
    } else {
      fbq.queue.push(args);
    }
  };

  if (!window.fbq) window.fbq = fbq;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.queue = [];

  // Load the Facebook Pixel script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  // Initialize the pixel
  fbq('init', pixelId);
  fbq('track', 'PageView');
};

// Track Facebook Pixel events
export const trackFacebookEvent = (
  eventName: FacebookEventName,
  parameters: FacebookEventParams = {}
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('track', eventName, parameters);
    console.log(`Facebook Pixel: Tracked ${eventName}`, parameters);
  } catch (error) {
    console.error('Facebook Pixel tracking error:', error);
  }
};

// Track custom events
export const trackFacebookCustomEvent = (
  eventName: string,
  parameters: FacebookEventParams = {}
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    window.fbq('trackCustom', eventName, parameters);
    console.log(
      `Facebook Pixel: Tracked custom event ${eventName}`,
      parameters
    );
  } catch (error) {
    console.error('Facebook Pixel custom tracking error:', error);
  }
};

// Page view tracking
export const trackPageView = (url?: string): void => {
  trackFacebookEvent('PageView');
};

// Conversion tracking helpers
export const trackPurchase = (
  value: number,
  currency = 'USD',
  transactionId?: string
): void => {
  trackFacebookEvent('Purchase', {
    value,
    currency,
    content_type: 'subscription',
    external_id: transactionId,
  });
};

export const trackRegistration = (method = 'email'): void => {
  trackFacebookEvent('CompleteRegistration', {
    content_name: 'user_registration',
    status: 'completed',
  });
};

export const trackSubscription = (
  subscriptionType: string,
  value?: number
): void => {
  trackFacebookEvent('Subscribe', {
    content_name: subscriptionType,
    value: value || 0,
    currency: 'USD',
    predicted_ltv: value ? value * 12 : undefined, // Assume annual LTV
  });
};

export const trackLead = (source?: string): void => {
  trackFacebookEvent('Lead', {
    lead_event_source: source || 'website',
    content_name: 'contact_form',
  });
};

export const trackInitiateCheckout = (
  value?: number,
  packageName?: string
): void => {
  trackFacebookEvent('InitiateCheckout', {
    value: value || 0,
    currency: 'USD',
    content_name: packageName || 'quran_package',
    content_type: 'subscription',
    num_items: 1,
  });
};

export const trackAddPaymentInfo = (): void => {
  trackFacebookEvent('AddPaymentInfo', {
    content_category: 'subscription',
  });
};

export const trackStartTrial = (trialType: string): void => {
  trackFacebookEvent('StartTrial', {
    content_name: trialType,
    content_type: 'trial',
    predicted_ltv: 50, // Estimated trial to paid conversion value
  });
};

// Advanced tracking with user data
export const trackWithUserData = (
  eventName: FacebookEventName,
  parameters: FacebookEventParams = {},
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    externalId?: string;
  } = {}
): void => {
  if (typeof window === 'undefined' || !window.fbq) return;

  try {
    // Set user data for enhanced matching
    if (Object.keys(userData).length > 0) {
      const hashedUserData: any = {};

      if (userData.email)
        hashedUserData.em = userData.email.toLowerCase().trim();
      if (userData.phone) hashedUserData.ph = userData.phone.replace(/\D/g, '');
      if (userData.firstName)
        hashedUserData.fn = userData.firstName.toLowerCase().trim();
      if (userData.lastName)
        hashedUserData.ln = userData.lastName.toLowerCase().trim();
      if (userData.externalId) hashedUserData.external_id = userData.externalId;

      window.fbq('track', eventName, parameters, {
        eventID: Date.now().toString(),
      });
    } else {
      window.fbq('track', eventName, parameters);
    }

    console.log(`Facebook Pixel: Tracked ${eventName} with user data`, {
      parameters,
      userData,
    });
  } catch (error) {
    console.error('Facebook Pixel advanced tracking error:', error);
  }
};

// Utility to check if Facebook Pixel is loaded
export const isFacebookPixelLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.fbq;
};

// Get Facebook Pixel ID from environment
export const getFacebookPixelId = (): string | undefined => {
  return process.env.NEXT_PUBLIC_FB_PIXEL_ID;
};
