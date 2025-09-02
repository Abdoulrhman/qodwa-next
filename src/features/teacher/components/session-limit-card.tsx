import { useSessionLimit } from '../../../hooks/use-session-limit';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SessionLimitCardProps {
  studentId: string;
}

export function SessionLimitCard({ studentId }: SessionLimitCardProps) {
  const { data, loading, error } = useSessionLimit(studentId);
  const t = useTranslations();

  if (loading) {
    return (
      <div className='p-3 bg-muted rounded-md'>
        <div className='text-xs text-muted-foreground'>
          Loading session info...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className='p-3 bg-destructive/10 rounded-md'>
        <div className='text-xs text-destructive'>
          Failed to load session info
        </div>
      </div>
    );
  }

  const getVariant = () => {
    if (data.remainingSessions <= 0) return 'destructive';
    if (data.remainingSessions <= 2) return 'secondary';
    return 'default';
  };

  const getIcon = () => {
    if (data.remainingSessions <= 0) return <AlertCircle className='h-3 w-3' />;
    if (data.remainingSessions <= 2) return <Clock className='h-3 w-3' />;
    return <CheckCircle className='h-3 w-3' />;
  };

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-medium'>Monthly Sessions</span>
        <Badge variant={getVariant()} className='text-xs'>
          {getIcon()}
          <span className='ml-1'>
            {data.sessionsUsed + data.sessionsScheduled}/{data.sessionsTotal}
          </span>
        </Badge>
      </div>

      <div className='text-xs text-muted-foreground space-y-1'>
        <div className='flex justify-between'>
          <span>Completed:</span>
          <span>{data.sessionsUsed}</span>
        </div>
        {data.sessionsScheduled > 0 && (
          <div className='flex justify-between'>
            <span>Scheduled:</span>
            <span>{data.sessionsScheduled}</span>
          </div>
        )}
        <div className='flex justify-between'>
          <span>Remaining:</span>
          <span>{data.remainingSessions}</span>
        </div>
      </div>

      {data.remainingSessions <= 0 && (
        <div className='p-2 bg-destructive/10 rounded-md'>
          <div className='text-xs text-destructive flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            <span>Monthly limit reached</span>
          </div>
          <div className='text-xs text-muted-foreground mt-1'>
            Resets: {new Date(data.nextMonthStart).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
