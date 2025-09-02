import { useState, useEffect } from 'react';

interface SessionLimitData {
  canStartSession: boolean;
  reason: string | null;
  sessionsUsed: number;
  sessionsScheduled: number;
  sessionsTotal: number;
  remainingSessions: number;
  subscriptionEndDate: string | null;
  nextMonthStart: string;
  packageTitle: string;
}

export function useSessionLimit(studentId: string) {
  const [data, setData] = useState<SessionLimitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) return;

    const fetchSessionLimit = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/teacher/students/${studentId}/session-limit`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch session limit');
        }

        const sessionLimitData = await response.json();
        setData(sessionLimitData);
        setError(null);
      } catch (err) {
        console.error('Error fetching session limit:', err);
        setError('Failed to fetch session limit');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionLimit();
  }, [studentId]);

  return {
    data,
    loading,
    error,
    refetch: () => {
      if (studentId) {
        const fetchSessionLimit = async () => {
          try {
            setLoading(true);
            const response = await fetch(
              `/api/teacher/students/${studentId}/session-limit`
            );

            if (!response.ok) {
              throw new Error('Failed to fetch session limit');
            }

            const sessionLimitData = await response.json();
            setData(sessionLimitData);
            setError(null);
          } catch (err) {
            console.error('Error fetching session limit:', err);
            setError('Failed to fetch session limit');
            setData(null);
          } finally {
            setLoading(false);
          }
        };

        fetchSessionLimit();
      }
    },
  };
}
