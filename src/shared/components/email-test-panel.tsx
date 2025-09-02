'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { TestTube, Mail } from 'lucide-react';

export default function EmailTestPanel() {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async (type: string) => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/test-email-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          data: {
            email: testEmail,
            name: 'Test User',
            subject: 'Test Email from Qodwa',
            message:
              'This is a test email to verify the email system is working correctly.',
            teacherName: 'Test Teacher',
            approvalStatus: 'APPROVED',
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`${result.message} - Check your email!`);
      } else {
        toast.error(result.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <TestTube className='h-5 w-5' />
          Email System Test
        </CardTitle>
        <CardDescription>
          Test the email system with sample emails
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='testEmail'>Test Email Address</Label>
          <Input
            id='testEmail'
            type='email'
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder='Enter your email to receive test emails'
          />
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => sendTestEmail('test_student_welcome')}
            disabled={loading}
          >
            <Mail className='h-4 w-4 mr-1' />
            Student Welcome
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => sendTestEmail('test_teacher_welcome')}
            disabled={loading}
          >
            <Mail className='h-4 w-4 mr-1' />
            Teacher Welcome
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => sendTestEmail('test_bulk_students')}
            disabled={loading}
          >
            <Mail className='h-4 w-4 mr-1' />
            Student Bulk
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => sendTestEmail('test_bulk_teachers')}
            disabled={loading}
          >
            <Mail className='h-4 w-4 mr-1' />
            Teacher Bulk
          </Button>
        </div>

        {loading && (
          <p className='text-sm text-muted-foreground text-center'>
            Sending test email...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
