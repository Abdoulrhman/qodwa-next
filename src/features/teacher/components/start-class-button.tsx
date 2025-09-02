import { useSessionLimit } from '../../../hooks/use-session-limit';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface StartClassButtonProps {
  studentId: string;
  zoomLink: string | null | undefined;
  onStartClass: () => void;
}

export function StartClassButton({
  studentId,
  zoomLink,
  onStartClass,
}: StartClassButtonProps) {
  const { data: sessionLimit, loading } = useSessionLimit(studentId);

  const isDisabled =
    !zoomLink || loading || (sessionLimit && !sessionLimit.canStartSession);

  const getDisabledReason = () => {
    if (!zoomLink) return 'No Zoom link available';
    if (loading) return 'Loading session info...';
    if (sessionLimit && !sessionLimit.canStartSession)
      return sessionLimit.reason || 'Session limit reached';
    return null;
  };

  return (
    <Button
      size='sm'
      variant='default'
      className='w-full'
      onClick={onStartClass}
      disabled={!!isDisabled}
      title={getDisabledReason() || 'Start class session'}
    >
      <Play className='h-3 w-3 mr-2' />
      Start Class
    </Button>
  );
}
