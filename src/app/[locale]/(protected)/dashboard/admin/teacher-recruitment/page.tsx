'use client';

import { useState } from 'react';
import {
  Send,
  Mail,
  Users,
  CheckCircle,
  AlertCircle,
  Copy,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { RoleGate } from '@/src/features/auth/components/role-gate';

interface EmailResult {
  email: string;
  success: boolean;
  id?: string;
  error?: string;
}

interface SendResults {
  successful: EmailResult[];
  failed: EmailResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export default function TeacherRecruitmentPage() {
  const [emailInput, setEmailInput] = useState('');
  const [subject, setSubject] = useState(
    '🎓 Teaching Opportunity at Qodwa Platform - $5/Hour'
  );
  const [customMessage, setCustomMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResults, setLastResults] = useState<SendResults | null>(null);

  // Parse emails from comma-separated input
  const parseEmails = (input: string): string[] => {
    return input
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  };

  const emailList = parseEmails(emailInput);
  const validEmails = emailList.filter((email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
  const invalidEmails = emailList.filter(
    (email) => email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );

  // Handle sending recruitment emails
  const handleSendEmails = async () => {
    if (validEmails.length === 0) {
      toast.error('Please enter at least one valid email address');
      return;
    }

    console.log('🚀 Starting email send process...');
    console.log('Valid emails:', validEmails);
    console.log('Subject:', subject);
    console.log('Custom message length:', customMessage.length);

    setLoading(true);
    try {
      console.log('📤 Making API request to /api/admin/teacher-recruitment');
      const response = await fetch('/api/admin/teacher-recruitment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: validEmails,
          subject: subject.trim(),
          customMessage: customMessage.trim(),
        }),
      });

      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);

      const data = await response.json();
      console.log('📨 Response data:', data);

      if (!response.ok) {
        console.error('❌ API Error:', data);
        throw new Error(data.error || 'Failed to send emails');
      }

      setLastResults(data.results);
      console.log('✅ Emails sent successfully:', data);
      toast.success(data.message);

      // Clear form on success
      setEmailInput('');
      setCustomMessage('');
    } catch (error: any) {
      console.error('❌ Error sending recruitment emails:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      toast.error(error.message || 'Failed to send recruitment emails');
    } finally {
      console.log('🏁 Email send process completed');
      setLoading(false);
    }
  };

  // Copy default template
  const copyDefaultTemplate = () => {
    const defaultTemplate = `We are excited to invite you to join the Qodwa Platform as a Quran and Arabic teacher. Our platform connects dedicated educators with students worldwide who are eager to learn.

As a teacher on our platform, you will:
• Earn $5.00 per hour for every teaching session
• Work with motivated students from around the globe
• Have flexible scheduling that fits your availability
• Receive ongoing support from our dedicated team

We are looking for qualified teachers who are passionate about Islamic education and have expertise in Quran recitation, Tajweed, or Arabic language instruction.`;

    setCustomMessage(defaultTemplate);
    toast.success('Default template copied to message box');
  };

  return (
    <RoleGate allowedRole='ADMIN'>
      <div className='container mx-auto py-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold flex items-center gap-2'>
              <Users className='h-8 w-8' />
              Teacher Recruitment
            </h1>
            <p className='text-muted-foreground'>
              Send recruitment emails to potential teachers to join Qodwa
              Platform
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Email Composition */}
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Mail className='h-5 w-5' />
                  Compose Recruitment Email
                </CardTitle>
                <CardDescription>
                  Send professional recruitment emails to potential teachers
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Subject Line */}
                <div className='space-y-2'>
                  <Label htmlFor='subject'>Email Subject</Label>
                  <Input
                    id='subject'
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder='Enter email subject...'
                  />
                </div>

                {/* Email Addresses */}
                <div className='space-y-2'>
                  <Label htmlFor='emails'>Teacher Email Addresses</Label>
                  <Textarea
                    id='emails'
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder='Enter email addresses separated by commas&#10;Example: teacher1@example.com, teacher2@gmail.com, teacher3@hotmail.com'
                    rows={4}
                  />
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {validEmails.length > 0 && (
                      <Badge
                        variant='secondary'
                        className='text-green-700 bg-green-100'
                      >
                        <CheckCircle className='h-3 w-3 mr-1' />
                        {validEmails.length} valid emails
                      </Badge>
                    )}
                    {invalidEmails.length > 0 && (
                      <Badge variant='destructive'>
                        <AlertCircle className='h-3 w-3 mr-1' />
                        {invalidEmails.length} invalid emails
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Custom Message */}
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label htmlFor='message'>Custom Message (Optional)</Label>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={copyDefaultTemplate}
                    >
                      <Copy className='h-3 w-3 mr-1' />
                      Use Template
                    </Button>
                  </div>
                  <Textarea
                    id='message'
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder='Add a personal message (optional). If left empty, a default recruitment message will be used.'
                    rows={6}
                  />
                  <p className='text-xs text-muted-foreground'>
                    This message will be included in the email along with
                    platform details and the $5/hour offer.
                  </p>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendEmails}
                  disabled={loading || validEmails.length === 0}
                  className='w-full'
                  size='lg'
                >
                  {loading ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Sending Emails...
                    </>
                  ) : (
                    <>
                      <Send className='h-4 w-4 mr-2' />
                      Send Recruitment Emails ({validEmails.length})
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Email Preview & Info */}
          <div className='space-y-4'>
            {/* Email Info */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <CheckCircle className='h-5 w-5' />
                  Email Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <p className='font-medium text-muted-foreground'>
                      Registration URL
                    </p>
                    <p className='text-blue-600 break-all'>
                      https://www.qodwaplatform.com/en/teacher/register
                    </p>
                  </div>
                  <div>
                    <p className='font-medium text-muted-foreground'>
                      Hourly Rate
                    </p>
                    <p className='text-green-600 font-bold text-lg'>
                      $5.00/hour
                    </p>
                  </div>
                  <div>
                    <p className='font-medium text-muted-foreground'>
                      Email Template
                    </p>
                    <p>Professional HTML email with branding</p>
                  </div>
                  <div>
                    <p className='font-medium text-muted-foreground'>
                      Response Tracking
                    </p>
                    <p>Individual email status monitoring</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Results */}
            {lastResults && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Mail className='h-5 w-5' />
                    Last Send Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-3 gap-4 mb-4'>
                    <div className='text-center'>
                      <p className='text-2xl font-bold'>
                        {lastResults.summary.total}
                      </p>
                      <p className='text-sm text-muted-foreground'>Total</p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-green-600'>
                        {lastResults.summary.successful}
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        Successful
                      </p>
                    </div>
                    <div className='text-center'>
                      <p className='text-2xl font-bold text-red-600'>
                        {lastResults.summary.failed}
                      </p>
                      <p className='text-sm text-muted-foreground'>Failed</p>
                    </div>
                  </div>

                  {lastResults.failed.length > 0 && (
                    <div className='space-y-2'>
                      <Separator />
                      <h4 className='font-medium text-destructive'>
                        Failed Emails:
                      </h4>
                      {lastResults.failed.map((result, index) => (
                        <div
                          key={index}
                          className='text-sm text-muted-foreground'
                        >
                          <span className='font-mono'>{result.email}</span>
                          <span className='text-red-600 ml-2'>
                            - {result.error}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Email Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
                <CardDescription>
                  This is what teachers will receive
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='bg-muted p-3 rounded border-l-4 border-blue-500'>
                  <p className='font-medium'>
                    Professional HTML email includes:
                  </p>
                  <ul className='list-disc list-inside mt-2 space-y-1 text-muted-foreground'>
                    <li>Qodwa Platform branding and logo</li>
                    <li>Clear $5/hour compensation highlight</li>
                    <li>Registration link to the teacher signup page</li>
                    <li>Benefits of joining the platform</li>
                    <li>Requirements and qualifications needed</li>
                    <li>Step-by-step onboarding process</li>
                    <li>Contact information for support</li>
                  </ul>
                </div>

                <div className='bg-green-50 p-3 rounded border-l-4 border-green-500'>
                  <p className='font-medium text-green-800'>
                    Key Selling Points:
                  </p>
                  <ul className='list-disc list-inside mt-2 space-y-1 text-green-700'>
                    <li>Competitive $5/hour rate</li>
                    <li>Flexible scheduling</li>
                    <li>Global student reach</li>
                    <li>Professional platform support</li>
                    <li>Immediate payment processing</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
