// Hotjar TypeScript definitions
declare global {
  interface Window {
    hj: any;
    _hjSettings: {
      hjid: number;
      hjsv: number;
    };
  }
}

// Hotjar event types
export type HotjarEventName = 'identify' | 'track' | 'trigger';

export interface HotjarIdentifyData {
  userId?: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface HotjarEventParams {
  [key: string]: any;
}

// Initialize Hotjar
export const initHotjar = (hjid: string | number): void => {
  if (typeof window === 'undefined' || !hjid) return;

  const hotjarId = typeof hjid === 'string' ? parseInt(hjid, 10) : hjid;
  
  // Check if already initialized
  if (window.hj && window._hjSettings) return;

  try {
    // Initialize hj function
    const hj: any = function (...args: any[]) {
      (hj.q = hj.q || []).push(args);
    };

    window.hj = hj;
    window._hjSettings = { hjid: hotjarId, hjsv: 6 };

    // Load the Hotjar script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://static.hotjar.com/c/hotjar-${hotjarId}.js?sv=6`;
    
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    console.log(`Hotjar initialized with ID: ${hotjarId}`);
  } catch (error) {
    console.error('Hotjar initialization error:', error);
  }
};

// Identify user for Hotjar
export const identifyHotjarUser = (data: HotjarIdentifyData): void => {
  if (typeof window === 'undefined' || !window.hj) return;

  try {
    window.hj('identify', data.userId, data);
    console.log('Hotjar: User identified', data);
  } catch (error) {
    console.error('Hotjar identify error:', error);
  }
};

// Track Hotjar events
export const trackHotjarEvent = (
  eventName: string,
  parameters: HotjarEventParams = {}
): void => {
  if (typeof window === 'undefined' || !window.hj) return;

  try {
    window.hj('event', eventName, parameters);
    console.log(`Hotjar: Tracked event ${eventName}`, parameters);
  } catch (error) {
    console.error('Hotjar event tracking error:', error);
  }
};

// Trigger Hotjar poll or survey
export const triggerHotjarPoll = (pollId: string): void => {
  if (typeof window === 'undefined' || !window.hj) return;

  try {
    window.hj('trigger', pollId);
    console.log(`Hotjar: Triggered poll ${pollId}`);
  } catch (error) {
    console.error('Hotjar poll trigger error:', error);
  }
};

// Start Hotjar virtual page view
export const trackHotjarVirtualPageView = (virtualUrl: string): void => {
  if (typeof window === 'undefined' || !window.hj) return;

  try {
    window.hj('vpv', virtualUrl);
    console.log(`Hotjar: Virtual page view ${virtualUrl}`);
  } catch (error) {
    console.error('Hotjar virtual page view error:', error);
  }
};

// Tag recording
export const tagHotjarRecording = (tags: string[]): void => {
  if (typeof window === 'undefined' || !window.hj) return;

  try {
    tags.forEach(tag => {
      window.hj('tagRecording', [tag]);
    });
    console.log('Hotjar: Tagged recording', tags);
  } catch (error) {
    console.error('Hotjar recording tagging error:', error);
  }
};

// Get Hotjar session URL (useful for debugging)
export const getHotjarSessionUrl = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.hj) {
      resolve(null);
      return;
    }

    try {
      window.hj('event', 'session_url_request');
      // Note: This is a simplified version. In practice, you'd need to implement
      // a listener for the session URL response from Hotjar
      resolve(null);
    } catch (error) {
      console.error('Hotjar session URL error:', error);
      resolve(null);
    }
  });
};

// Utility to check if Hotjar is loaded
export const isHotjarLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.hj && !!window._hjSettings;
};

// Get current Hotjar configuration
export const getHotjarConfig = () => {
  if (typeof window === 'undefined' || !window._hjSettings) {
    return null;
  }
  
  return {
    hjid: window._hjSettings.hjid,
    hjsv: window._hjSettings.hjsv,
    loaded: isHotjarLoaded()
  };
};