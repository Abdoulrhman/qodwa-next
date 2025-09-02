'use client';

import { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { useSessionLimit } from '../../../hooks/use-session-limit';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentNotesDialog } from './student-notes-dialog';
import { SessionLimitCard } from './session-limit-card';
import { StartClassButton } from './start-class-button';
import {
  Search,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Copy,
  Play,
  Square,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { hasTeacherAccess } from '@/shared/utils/teacher-utils';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  status: string;
  classes_completed: number;
  total_classes: number;
  package: {
    title: string;
    class_duration: number;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  assignedAt?: string;
  activeSubscriptions: number;
  completedClasses: number;
  nextClassDate?: string;
  zoomLink?: string;
  subscriptions?: Subscription[];
}

export const TeacherStudentManagement = () => {
  const t = useTranslations();
  const user = useCurrentUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeClasses, setActiveClasses] = useState<
    Record<
      string,
      {
        isActive: boolean;
        timeRemaining: number;
        intervalId?: NodeJS.Timeout;
      }
    >
  >({});

  const intervalRefs = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/teacher/students');
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hasTeacherAccess(user)) {
      fetchStudents();
    }
  }, [user]);

  // Cleanup intervals on unmount
  useEffect(() => {
    const currentIntervals = intervalRefs.current;
    return () => {
      Object.values(currentIntervals).forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  const copyZoomLink = async (zoomLink: string) => {
    try {
      await navigator.clipboard.writeText(zoomLink);
      toast.success('Zoom link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy zoom link');
    }
  };

  const startClass = async (studentId: string) => {
    try {
      // Check session limit before starting class
      const sessionLimitResponse = await fetch(
        `/api/teacher/students/${studentId}/session-limit`
      );

      if (sessionLimitResponse.ok) {
        const sessionLimitData = await sessionLimitResponse.json();

        if (!sessionLimitData.canStartSession) {
          alert(`Cannot start class: ${sessionLimitData.reason}`);
          return;
        }
      }

      const response = await fetch('/api/teacher/classes/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        // Start 30-minute timer
        const intervalId = setInterval(() => {
          setActiveClasses((prev) => {
            const current = prev[studentId];
            if (current && current.timeRemaining > 0) {
              return {
                ...prev,
                [studentId]: {
                  ...current,
                  timeRemaining: current.timeRemaining - 1,
                },
              };
            } else {
              // Time's up, automatically end class
              endClass(studentId);
              return prev;
            }
          });
        }, 1000);

        intervalRefs.current[studentId] = intervalId;

        setActiveClasses((prev) => ({
          ...prev,
          [studentId]: {
            isActive: true,
            timeRemaining: 30 * 60, // 30 minutes in seconds
            intervalId,
          },
        }));

        toast.success('Class started! 30-minute timer is running.');
      } else {
        toast.error('Failed to start class');
      }
    } catch (error) {
      console.error('Error starting class:', error);
      toast.error('Failed to start class');
    }
  };

  const endClass = async (studentId: string) => {
    try {
      const response = await fetch('/api/teacher/classes/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId }),
      });

      if (response.ok) {
        // Clear interval
        const intervalId = intervalRefs.current[studentId];
        if (intervalId) {
          clearInterval(intervalId);
          delete intervalRefs.current[studentId];
        }

        setActiveClasses((prev) => {
          const newState = { ...prev };
          delete newState[studentId];
          return newState;
        });

        toast.success('Class ended! Teacher earnings updated.');

        // Refresh students data to show updated stats
        const studentsResponse = await fetch('/api/teacher/students');
        if (studentsResponse.ok) {
          const data = await studentsResponse.json();
          setStudents(data);
        }
      } else {
        toast.error('Failed to end class');
      }
    } catch (error) {
      console.error('Error ending class:', error);
      toast.error('Failed to end class');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (subscription: Subscription) => {
    if (!subscription.total_classes || subscription.total_classes === 0)
      return 0;
    return Math.round(
      (subscription.classes_completed / subscription.total_classes) * 100
    );
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!hasTeacherAccess(user)) {
    return (
      <div className='text-center py-8'>
        <p className='text-muted-foreground'>
          Access denied. Teacher account required.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>
            {t('teacherStudents.title', { default: 'My Students' })}
          </h1>
          <p className='text-muted-foreground'>
            {t('teacherStudents.subtitle', {
              default: "Manage and track your students' progress",
            })}
          </p>
        </div>
        <Badge variant='secondary'>
          {students.length}{' '}
          {t('teacherStudents.students', { default: 'Students' })}
        </Badge>
      </div>

      {/* Search */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        <Input
          placeholder={t('teacherStudents.searchPlaceholder', {
            default: 'Search students by name or email...',
          })}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Students List */}
      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(6)].map((_, i) => (
            <Card key={i} className='animate-pulse'>
              <CardContent className='p-6'>
                <div className='h-20 bg-muted rounded'></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className='text-center py-8'>
            <p className='text-muted-foreground'>
              {searchTerm
                ? t('teacherStudents.noSearchResults', {
                    default: 'No students found matching your search.',
                  })
                : t('teacherStudents.noStudents', {
                    default: 'No students assigned yet.',
                  })}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredStudents.map((student) => {
            const classState = activeClasses[student.id];
            const hasActiveSubscription = student.subscriptions?.some(
              (sub) => sub.status === 'ACTIVE'
            );

            return (
              <Card
                key={student.id}
                className='hover:shadow-md transition-shadow'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center space-x-4'>
                    <Avatar>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                      />
                      <AvatarFallback>
                        {student.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1 min-w-0'>
                      <CardTitle className='text-lg truncate'>
                        {student.name}
                      </CardTitle>
                      <CardDescription className='flex items-center gap-1'>
                        <Mail className='h-3 w-3' />
                        {student.email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Zoom Link Section */}
                  {student.zoomLink && (
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>Zoom Link:</label>
                      <div className='flex gap-2'>
                        <Input
                          value={student.zoomLink}
                          disabled
                          className='text-xs'
                        />
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => copyZoomLink(student.zoomLink!)}
                        >
                          <Copy className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Class Control Section */}
                  {hasActiveSubscription && (
                    <div className='space-y-2'>
                      {classState?.isActive ? (
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium flex items-center gap-2'>
                              <Clock className='h-3 w-3' />
                              Time Remaining:
                            </span>
                            <Badge variant='destructive'>
                              {formatTime(classState.timeRemaining)}
                            </Badge>
                          </div>
                          <Button
                            size='sm'
                            variant='destructive'
                            className='w-full'
                            onClick={() => endClass(student.id)}
                          >
                            <Square className='h-3 w-3 mr-2' />
                            End Class
                          </Button>
                        </div>
                      ) : (
                        <StartClassButton
                          studentId={student.id}
                          zoomLink={student.zoomLink}
                          onStartClass={() => startClass(student.id)}
                        />
                      )}
                    </div>
                  )}

                  {/* Session Limit Info */}
                  <SessionLimitCard studentId={student.id} />

                  {/* Class Notes Section */}
                  <div className='space-y-2'>
                    <StudentNotesDialog
                      student={{
                        id: student.id,
                        name: student.name,
                      }}
                      trigger={
                        <Button size='sm' variant='outline' className='w-full'>
                          <FileText className='h-3 w-3 mr-2' />
                          {t('teacherStudents.classNotes.title', {
                            default: 'Class Notes',
                          })}
                        </Button>
                      }
                    />
                  </div>

                  {/* Progress Section */}
                  {student.subscriptions &&
                    student.subscriptions.length > 0 && (
                      <div className='space-y-3'>
                        <h4 className='text-sm font-medium'>
                          Package Progress:
                        </h4>
                        {student.subscriptions.map((subscription) => (
                          <div key={subscription.id} className='space-y-2'>
                            <div className='flex justify-between text-xs'>
                              <span>{subscription.package.title}</span>
                              <span>
                                {subscription.classes_completed}/
                                {subscription.total_classes}
                              </span>
                            </div>
                            <Progress
                              value={getProgressPercentage(subscription)}
                              className='h-2'
                            />
                            <div className='text-xs text-muted-foreground'>
                              {getProgressPercentage(subscription)}% Complete
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Student Info */}
                  <div className='space-y-2 text-sm'>
                    {student.phone && (
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <Phone className='h-3 w-3' />
                        {student.phone}
                      </div>
                    )}
                    {student.birthDate && (
                      <div className='flex items-center gap-2 text-muted-foreground'>
                        <Calendar className='h-3 w-3' />
                        {new Date(student.birthDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <BookOpen className='h-3 w-3' />
                      {student.completedClasses}{' '}
                      {t('teacherStudents.completedClasses', {
                        default: 'classes completed',
                      })}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className='flex justify-between items-center'>
                    <Badge
                      variant={
                        student.activeSubscriptions > 0
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {student.activeSubscriptions > 0
                        ? t('teacherStudents.active', { default: 'Active' })
                        : t('teacherStudents.inactive', {
                            default: 'Inactive',
                          })}
                    </Badge>
                    {student.gender && (
                      <Badge variant='outline'>{student.gender}</Badge>
                    )}
                  </div>

                  {/* Next Class */}
                  {student.nextClassDate && (
                    <div className='text-xs text-muted-foreground'>
                      {t('teacherStudents.nextClass', {
                        default: 'Next class',
                      })}
                      : {new Date(student.nextClassDate).toLocaleDateString()}
                    </div>
                  )}

                  {/* Warning for missing zoom link */}
                  {!student.zoomLink && hasActiveSubscription && (
                    <div className='flex items-center gap-2 text-amber-600 text-xs p-2 bg-amber-50 rounded'>
                      <AlertCircle className='h-3 w-3' />
                      No Zoom link assigned
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
