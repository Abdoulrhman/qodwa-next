'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface EmailStats {
  totalSent: number;
  successRate: number;
  studentsEmailed: number;
  teachersEmailed: number;
}

export default function EmailStatsCard() {
  const [stats, setStats] = useState<EmailStats>({
    totalSent: 0,
    successRate: 0,
    studentsEmailed: 0,
    teachersEmailed: 0,
  });

  useEffect(() => {
    // In a real implementation, you would fetch these stats from an API
    // For now, using mock data
    setStats({
      totalSent: 247,
      successRate: 98.5,
      studentsEmailed: 156,
      teachersEmailed: 91,
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Mail className='h-5 w-5' />
          Email Statistics
        </CardTitle>
        <CardDescription>Overview of email system performance</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.totalSent}
            </div>
            <div className='text-sm text-muted-foreground'>Total Sent</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.successRate}%
            </div>
            <div className='text-sm text-muted-foreground'>Success Rate</div>
          </div>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-blue-500' />
              <span className='text-sm'>Students</span>
            </div>
            <Badge variant='secondary'>{stats.studentsEmailed}</Badge>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-purple-500' />
              <span className='text-sm'>Teachers</span>
            </div>
            <Badge variant='secondary'>{stats.teachersEmailed}</Badge>
          </div>
        </div>

        <div className='pt-4 border-t'>
          <h4 className='text-sm font-medium mb-2'>Recent Activity</h4>
          <div className='space-y-2 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-3 w-3 text-green-500' />
              <span>Welcome email sent to 5 new students</span>
              <span className='ml-auto'>2 hours ago</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-3 w-3 text-green-500' />
              <span>Teacher approval emails sent</span>
              <span className='ml-auto'>4 hours ago</span>
            </div>
            <div className='flex items-center gap-2'>
              <Clock className='h-3 w-3 text-yellow-500' />
              <span>Monthly newsletter scheduled</span>
              <span className='ml-auto'>1 day ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
