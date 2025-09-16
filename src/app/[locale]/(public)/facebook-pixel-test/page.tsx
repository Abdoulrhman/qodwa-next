'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  trackPageView,
  trackRegistration,
  trackPurchase,
  trackSubscription,
  trackInitiateCheckout,
  trackLead,
  trackFacebookCustomEvent,
  isFacebookPixelLoaded,
  getFacebookPixelId,
} from '@/lib/facebook-pixel';

export default function FacebookPixelTestPage() {
  const pixelId = getFacebookPixelId();
  const isLoaded = isFacebookPixelLoaded();

  const testEvents = [
    {
      name: 'Page View',
      description: 'Track a page view event',
      action: () => trackPageView(),
    },
    {
      name: 'Registration',
      description: 'Track a registration completion',
      action: () => trackRegistration('email'),
    },
    {
      name: 'Purchase',
      description: 'Track a test purchase ($50)',
      action: () => trackPurchase(50, 'USD', 'test-transaction-123'),
    },
    {
      name: 'Subscription',
      description: 'Track a subscription event',
      action: () => trackSubscription('monthly_quran_package', 45),
    },
    {
      name: 'Initiate Checkout',
      description: 'Track checkout initiation',
      action: () => trackInitiateCheckout(45, 'Monthly Quran Package'),
    },
    {
      name: 'Lead',
      description: 'Track a lead generation',
      action: () => trackLead('contact_form'),
    },
    {
      name: 'Custom Event',
      description: 'Track a custom event',
      action: () =>
        trackFacebookCustomEvent('TestEvent', { content_name: 'test_value' }),
    },
  ];

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Facebook Pixel Integration Test</CardTitle>
          <CardDescription>
            Test Facebook Pixel events and verify integration status
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <strong>Pixel ID:</strong> {pixelId || 'Not configured'}
            </div>
            <div>
              <strong>Status:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded text-sm ${
                  isLoaded
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isLoaded ? 'Loaded' : 'Not Loaded'}
              </span>
            </div>
          </div>

          {!isLoaded && (
            <div className='bg-yellow-50 border border-yellow-200 p-4 rounded-lg'>
              <p className='text-yellow-800'>
                <strong>Warning:</strong> Facebook Pixel is not loaded. Make
                sure NEXT_PUBLIC_FB_PIXEL_ID is set correctly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Events</CardTitle>
          <CardDescription>
            Click the buttons below to fire test events. Monitor them in
            Facebook Events Manager or browser console.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {testEvents.map((event, index) => (
              <Card key={index} className='p-4'>
                <h4 className='font-semibold mb-2'>{event.name}</h4>
                <p className='text-sm text-gray-600 mb-3'>
                  {event.description}
                </p>
                <Button
                  onClick={event.action}
                  disabled={!isLoaded}
                  size='sm'
                  className='w-full'
                >
                  Fire Event
                </Button>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Browser Console</CardTitle>
          <CardDescription>
            Open your browser&apos;s developer console to see event tracking
            logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className='block bg-gray-100 p-4 rounded text-sm'>
            {`// Check pixel status
console.log('FB Pixel:', window.fbq);

// Manual event test
window.fbq && window.fbq('track', 'ViewContent', {
  content_name: 'test_page',
  content_type: 'page'
});`}
          </code>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className='list-decimal list-inside space-y-2 text-sm'>
            <li>Install Facebook Pixel Helper Chrome extension</li>
            <li>
              Verify pixel fires on page load (should see green checkmark)
            </li>
            <li>
              Click test event buttons and verify they appear in the extension
            </li>
            <li>Check Facebook Events Manager for live events</li>
            <li>Monitor browser console for tracking logs</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
