// Example of integrating Hotjar tracking into existing components
// This file shows practical examples of how to add Hotjar tracking to your app

import { 
  trackHotjarEvent, 
  identifyHotjarUser, 
  tagHotjarRecording 
} from '@/lib/hotjar';

/**
 * Example 1: Track registration form submissions
 * Add this to your registration components
 */
export const trackRegistrationAttempt = (formType: 'student' | 'teacher') => {
  trackHotjarEvent('registration_started', {
    form_type: formType,
    timestamp: new Date().toISOString(),
    page: window.location.pathname
  });
};

export const trackRegistrationSuccess = (userData: {
  userId: string;
  email: string;
  userType: 'student' | 'teacher';
}) => {
  // Identify the user
  identifyHotjarUser({
    userId: userData.userId,
    email: userData.email,
    userType: userData.userType,
    registrationDate: new Date().toISOString()
  });

  // Track the successful registration
  trackHotjarEvent('registration_completed', {
    user_type: userData.userType,
    success: true
  });

  // Tag the recording for easy filtering
  tagHotjarRecording(['conversion', `${userData.userType}-registration`]);
};

export const trackRegistrationError = (error: string, formType: string) => {
  trackHotjarEvent('registration_error', {
    error_type: error,
    form_type: formType
  });

  tagHotjarRecording(['registration-error', 'form-error']);
};

/**
 * Example 2: Track package selection and checkout
 */
export const trackPackageView = (packageId: string, packageName: string) => {
  trackHotjarEvent('package_viewed', {
    package_id: packageId,
    package_name: packageName,
    page: 'packages'
  });
};

export const trackPackageSelection = (packageData: {
  id: string;
  name: string;
  price: number;
  duration: string;
}) => {
  trackHotjarEvent('package_selected', {
    package_id: packageData.id,
    package_name: packageData.name,
    price: packageData.price,
    duration: packageData.duration
  });
};

export const trackCheckoutStarted = (packageData: any) => {
  trackHotjarEvent('checkout_started', {
    package_id: packageData.id,
    value: packageData.price,
    currency: 'USD'
  });
};

export const trackPaymentSuccess = (orderData: {
  orderId: string;
  packageId: string;
  amount: number;
  paymentMethod: string;
}) => {
  trackHotjarEvent('payment_completed', orderData);
  tagHotjarRecording(['conversion', 'payment-success']);
};

/**
 * Example 3: Track user interactions
 */
export const trackNavigation = (section: string) => {
  trackHotjarEvent('navigation_click', {
    section,
    from_page: window.location.pathname
  });
};

export const trackCTAClick = (ctaType: string, location: string) => {
  trackHotjarEvent('cta_clicked', {
    cta_type: ctaType,
    location,
    page: window.location.pathname
  });
};

export const trackVideoPlay = (videoId: string, videoTitle: string) => {
  trackHotjarEvent('video_play', {
    video_id: videoId,
    video_title: videoTitle
  });
};

/**
 * Example 4: Track authentication events
 */
export const trackLoginAttempt = (method: 'email' | 'google' | 'github') => {
  trackHotjarEvent('login_attempt', {
    method,
    timestamp: new Date().toISOString()
  });
};

export const trackLoginSuccess = (userData: {
  userId: string;
  email: string;
  role: string;
}) => {
  identifyHotjarUser({
    userId: userData.userId,
    email: userData.email,
    role: userData.role,
    lastLogin: new Date().toISOString()
  });

  trackHotjarEvent('login_success', {
    user_role: userData.role
  });
};

export const trackLogout = () => {
  trackHotjarEvent('user_logout');
};

/**
 * Example 5: Track errors and issues
 */
export const trackError = (errorType: string, errorMessage: string, context?: any) => {
  trackHotjarEvent('error_occurred', {
    error_type: errorType,
    error_message: errorMessage,
    context,
    page: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  tagHotjarRecording(['error', errorType]);
};

export const track404Error = (attemptedUrl: string) => {
  trackHotjarEvent('404_error', {
    attempted_url: attemptedUrl,
    referrer: document.referrer
  });

  tagHotjarRecording(['404-error']);
};

/**
 * Example 6: Track feature usage
 */
export const trackFeatureUsage = (featureName: string, action: string) => {
  trackHotjarEvent('feature_usage', {
    feature: featureName,
    action,
    timestamp: new Date().toISOString()
  });
};

export const trackSearchUsage = (searchTerm: string, results: number) => {
  trackHotjarEvent('search_performed', {
    search_term: searchTerm,
    results_count: results
  });
};

/**
 * Example 7: Track user engagement
 */
export const trackTimeOnPage = (timeSpent: number) => {
  trackHotjarEvent('time_on_page', {
    time_spent_seconds: timeSpent,
    page: window.location.pathname
  });
};

export const trackScrollDepth = (depth: number) => {
  trackHotjarEvent('scroll_depth', {
    depth_percentage: depth,
    page: window.location.pathname
  });
};

// Example React hook for tracking page views
export const useHotjarPageTracking = () => {
  const trackPageView = (pageName: string, additionalData?: any) => {
    trackHotjarEvent('page_view', {
      page_name: pageName,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...additionalData
    });
  };

  return { trackPageView };
};