'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleGate } from '@/features/auth/components/role-gate';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  Mail,
  Settings,
  Bug,
  Send,
  Eye,
} from 'lucide-react';

interface EmailConfig {
  apiKey?: string;
  resendApiKey?: string;
  fromEmail?: string;
  resendFromEmail?: string;
  adminEmail?: string;
  baseUrl?: string;
  apiKeyLength?: number;
  nodeEnv?: string;
}

interface TestResult {
  action: string;
  success: boolean;
  message?: string;
  error?: string;
  result?: any;
  stack?: string;
  config?: EmailConfig;
}

export default function EmailDebugPage() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [lastResult, setLastResult] = useState<TestResult | null>(null);

  const testEmail = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();
      setLastResult({ action, ...result });

      if (result.success) {
        toast.success(`${action} completed successfully`);
      } else {
        toast.error(`${action} failed: ${result.error}`);
      }

      if (result.config) {
        setConfig(result.config);
      }
    } catch (error) {
      toast.error('Request failed');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/email', {
        method: 'GET',
      });

      const result = await response.json();
      setConfig(result.environment);
      setLastResult({ action: 'config_check', ...result });

      if (result.success) {
        toast.success('Configuration loaded');
      }
    } catch (error) {
      toast.error('Failed to load configuration');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (value: string | undefined) => {
    if (
      value === 'Set' ||
      value === 'Set (hidden)' ||
      (value && value !== 'Not set')
    ) {
      return <Badge className='bg-green-100 text-green-800'>✓ {value}</Badge>;
    }
    return (
      <Badge className='bg-red-100 text-red-800'>✗ {value || 'Not set'}</Badge>
    );
  };

  return (
    <RoleGate allowedRole='ADMIN'>
      <div className='container mx-auto py-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Email Debug Console</h1>
            <p className='text-muted-foreground'>
              Debug and test the email notification system
            </p>
          </div>
          <Button onClick={checkConfig} disabled={loading} variant='outline'>
            <Settings className='h-4 w-4 mr-2' />
            Load Config
          </Button>
        </div>

        {/* Configuration Status */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Settings className='h-5 w-5' />
              <span>Email Configuration Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {config ? (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm font-medium'>Resend API Key:</label>
                  {getStatusBadge(config.apiKey || config.resendApiKey)}
                </div>
                <div>
                  <label className='text-sm font-medium'>From Email:</label>
                  {getStatusBadge(config.fromEmail || config.resendFromEmail)}
                </div>
                <div>
                  <label className='text-sm font-medium'>Admin Email:</label>
                  {getStatusBadge(config.adminEmail)}
                </div>
                <div>
                  <label className='text-sm font-medium'>Base URL:</label>
                  {getStatusBadge(config.baseUrl)}
                </div>
                {config.apiKeyLength && (
                  <div>
                    <label className='text-sm font-medium'>
                      API Key Length:
                    </label>
                    <Badge className='bg-blue-100 text-blue-800'>
                      {config.apiKeyLength} chars
                    </Badge>
                  </div>
                )}
                {config.nodeEnv && (
                  <div>
                    <label className='text-sm font-medium'>Environment:</label>
                    <Badge className='bg-purple-100 text-purple-800'>
                      {config.nodeEnv}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <p className='text-muted-foreground'>
                Click &quot;Load Config&quot; to check configuration
              </p>
            )}
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Bug className='h-5 w-5' />
              <span>Email Tests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <Button
                onClick={() => testEmail('check_config')}
                disabled={loading}
                variant='outline'
                className='h-20 flex flex-col space-y-2'
              >
                <Eye className='h-6 w-6' />
                <span>Check Config</span>
              </Button>

              <Button
                onClick={() => testEmail('test_resend_direct')}
                disabled={loading}
                className='h-20 flex flex-col space-y-2'
              >
                <Send className='h-6 w-6' />
                <span>Test Resend Direct</span>
              </Button>

              <Button
                onClick={() => testEmail('test_admin_notification')}
                disabled={loading}
                variant='secondary'
                className='h-20 flex flex-col space-y-2'
              >
                <Mail className='h-6 w-6' />
                <span>Test Admin Notification</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Last Result */}
        {lastResult && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center space-x-2'>
                {lastResult.success ? (
                  <CheckCircle className='h-5 w-5 text-green-600' />
                ) : (
                  <XCircle className='h-5 w-5 text-red-600' />
                )}
                <span>Last Test Result: {lastResult.action}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <label className='text-sm font-medium'>Status:</label>
                  <Badge
                    className={
                      lastResult.success
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {lastResult.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>

                {lastResult.message && (
                  <div>
                    <label className='text-sm font-medium'>Message:</label>
                    <p className='text-sm'>{lastResult.message}</p>
                  </div>
                )}

                {lastResult.error && (
                  <div>
                    <label className='text-sm font-medium text-red-600'>
                      Error:
                    </label>
                    <p className='text-sm text-red-600'>{lastResult.error}</p>
                  </div>
                )}

                {lastResult.result && (
                  <div>
                    <label className='text-sm font-medium'>Full Result:</label>
                    <pre className='text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto'>
                      {JSON.stringify(lastResult.result, null, 2)}
                    </pre>
                  </div>
                )}

                {lastResult.stack && (
                  <div>
                    <label className='text-sm font-medium text-red-600'>
                      Stack Trace:
                    </label>
                    <pre className='text-xs bg-red-50 p-2 rounded mt-1 overflow-auto text-red-600'>
                      {lastResult.stack}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 text-sm'>
              <p>
                <strong>1. Check Config:</strong> Verify all environment
                variables are set correctly
              </p>
              <p>
                <strong>2. Test Resend Direct:</strong> Send a test email
                directly using Resend API
              </p>
              <p>
                <strong>3. Test Admin Notification:</strong> Test the complete
                notification system
              </p>
              <p>
                <strong>Common Issues:</strong>
              </p>
              <ul className='list-disc list-inside ml-4 space-y-1'>
                <li>Resend API key not set or invalid</li>
                <li>From email domain not verified in Resend</li>
                <li>Admin email address is invalid</li>
                <li>Email might be in spam/junk folder</li>
                <li>Resend rate limits or quota exceeded</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
