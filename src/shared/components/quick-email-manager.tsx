'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';

export default function QuickEmailManager() {
  const [emailType, setEmailType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    userIds: '',
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const sendQuickEmail = async () => {
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
          [emailType === 'student' ? 'studentIds' : 'teacherIds']:
            formData.userIds
              ? formData.userIds.split(',').map((id: string) => id.trim())
              : undefined,
          includePersonalization: true,
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
          userIds: '',
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

  return (
    <Card className='max-w-2xl'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Mail className='h-5 w-5' />
          Quick Email
        </CardTitle>
        <CardDescription>
          Send a quick email to students or teachers
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label>Recipients</Label>
          <Select value={emailType} onValueChange={setEmailType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='student'>Students</SelectItem>
              <SelectItem value='teacher'>Teachers</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor='userIds'>Specific IDs (Optional)</Label>
          <Input
            id='userIds'
            value={formData.userIds}
            onChange={(e) => handleInputChange('userIds', e.target.value)}
            placeholder={`Enter ${emailType} IDs separated by commas (leave empty for all)`}
          />
        </div>

        <Button onClick={sendQuickEmail} disabled={loading} className='w-full'>
          {loading ? (
            'Sending...'
          ) : (
            <>
              <Send className='h-4 w-4 mr-2' />
              Send Email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
