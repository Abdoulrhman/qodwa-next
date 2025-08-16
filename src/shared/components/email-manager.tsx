'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Mail, Send, Users, User } from 'lucide-react';

interface EmailManagerProps {
  className?: string;
}

export default function EmailManager({ className }: EmailManagerProps) {
  const [emailType, setEmailType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    studentId: '',
    teacherId: '',
    studentIds: '',
    teacherIds: '',
    includePersonalization: true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const sendBulkEmail = async () => {
    if (!formData.subject || !formData.message) {
      toast.error('Please fill in subject and message');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `/api/emails/${emailType === 'student' ? 'students' : 'teachers'}`;
      const requestData = {
        type: 'bulk_email',
        data: {
          subject: formData.subject,
          message: formData.message,
          [emailType === 'student' ? 'studentIds' : 'teacherIds']: formData[
            emailType === 'student' ? 'studentIds' : 'teacherIds'
          ]
            ? formData[emailType === 'student' ? 'studentIds' : 'teacherIds']
                .split(',')
                .map((id: string) => id.trim())
            : undefined,
          includePersonalization: formData.includePersonalization,
        },
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Email sent successfully!');
        setFormData({
          subject: '',
          message: '',
          studentId: '',
          teacherId: '',
          studentIds: '',
          teacherIds: '',
          includePersonalization: true,
        });
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
    setLoading(false);
  };

  const sendSingleEmail = async (type: string) => {
    const id =
      emailType === 'student' ? formData.studentId : formData.teacherId;
    if (!id) {
      toast.error(`Please enter ${emailType} ID`);
      return;
    }

    setLoading(true);
    try {
      const endpoint = `/api/emails/${emailType === 'student' ? 'students' : 'teachers'}`;
      const requestData = {
        type,
        data:
          emailType === 'student'
            ? { studentId: formData.studentId }
            : { teacherId: formData.teacherId, approvalStatus: 'APPROVED' },
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message || 'Email sent successfully!');
        setFormData((prev) => ({
          ...prev,
          studentId: '',
          teacherId: '',
        }));
      } else {
        toast.error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email');
    }
    setLoading(false);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Mail className='h-5 w-5' />
          Email Manager
        </CardTitle>
        <CardDescription>Send emails to students and teachers</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Email Type Selection */}
        <div>
          <Label>Email Recipients</Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='student'>
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4' />
                  Students
                </div>
              </SelectItem>
              <SelectItem value='teacher'>
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4' />
                  Teachers
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Single Email Section */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Single Email</h3>
          <div>
            <Label htmlFor='singleId'>
              {emailType === 'student' ? 'Student' : 'Teacher'} ID
            </Label>
            <Input
              id='singleId'
              value={
                emailType === 'student'
                  ? formData.studentId
                  : formData.teacherId
              }
              onChange={(e) =>
                handleInputChange(
                  emailType === 'student' ? 'studentId' : 'teacherId',
                  e.target.value
                )
              }
              placeholder={`Enter ${emailType} ID`}
            />
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={() => sendSingleEmail('welcome')}
              disabled={loading}
              variant='outline'
            >
              Send Welcome Email
            </Button>
            {emailType === 'teacher' && (
              <Button
                onClick={() => sendSingleEmail('approval_status')}
                disabled={loading}
                variant='outline'
              >
                Send Approval Email
              </Button>
            )}
          </div>
        </div>

        {/* Bulk Email Section */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold'>Bulk Email</h3>
          <div>
            <Label htmlFor='subject'>Subject</Label>
            <Input
              id='subject'
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder='Enter email subject'
            />
          </div>
          <div>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              id='message'
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder='Enter your message...'
              rows={5}
            />
          </div>
          <div>
            <Label htmlFor='ids'>
              {emailType === 'student' ? 'Student' : 'Teacher'} IDs (Optional)
            </Label>
            <Input
              id='ids'
              value={
                emailType === 'student'
                  ? formData.studentIds
                  : formData.teacherIds
              }
              onChange={(e) =>
                handleInputChange(
                  emailType === 'student' ? 'studentIds' : 'teacherIds',
                  e.target.value
                )
              }
              placeholder={`Enter ${emailType} IDs separated by commas (leave empty for all ${emailType}s)`}
            />
          </div>
          <div className='flex items-center space-x-2'>
            <Switch
              id='personalization'
              checked={formData.includePersonalization}
              onCheckedChange={(checked) =>
                handleInputChange('includePersonalization', checked)
              }
            />
            <Label htmlFor='personalization'>
              Include personalization (Dear [Name])
            </Label>
          </div>
          <Button onClick={sendBulkEmail} disabled={loading} className='w-full'>
            {loading ? (
              'Sending...'
            ) : (
              <>
                <Send className='h-4 w-4 mr-2' />
                Send Bulk Email
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
