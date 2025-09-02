'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Mail, Users, Send, TestTube } from 'lucide-react';

export default function EmailGuideCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BookOpen className='h-5 w-5' />
          Email System Guide
        </CardTitle>
        <CardDescription>Quick guide to using the email system</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          <div className='flex items-start gap-3'>
            <div className='mt-1'>
              <TestTube className='h-4 w-4 text-blue-500' />
            </div>
            <div>
              <div className='font-medium text-sm'>Test First</div>
              <div className='text-xs text-muted-foreground'>
                Use the test panel to verify emails are working before sending
                to users
              </div>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='mt-1'>
              <Send className='h-4 w-4 text-green-500' />
            </div>
            <div>
              <div className='font-medium text-sm'>Quick Email</div>
              <div className='text-xs text-muted-foreground'>
                Send immediate emails to all students or teachers
              </div>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='mt-1'>
              <Users className='h-4 w-4 text-purple-500' />
            </div>
            <div>
              <div className='font-medium text-sm'>Targeted Emails</div>
              <div className='text-xs text-muted-foreground'>
                Use specific user IDs to target individual users
              </div>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='mt-1'>
              <Mail className='h-4 w-4 text-orange-500' />
            </div>
            <div>
              <div className='font-medium text-sm'>Advanced Features</div>
              <div className='text-xs text-muted-foreground'>
                Use the advanced manager for welcome emails, progress updates,
                etc.
              </div>
            </div>
          </div>
        </div>

        <div className='pt-4 border-t'>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='outline'>Students</Badge>
            <Badge variant='outline'>Teachers</Badge>
            <Badge variant='outline'>Bulk Email</Badge>
            <Badge variant='outline'>Test Mode</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
