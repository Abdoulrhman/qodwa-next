'use client';

import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Mail, Phone, Calendar, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { hasTeacherAccess } from '@/shared/utils/teacher-utils';

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
}

export const TeacherStudentManagement = () => {
  const t = useTranslations();
  const user = useCurrentUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
          {filteredStudents.map((student) => (
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
                      student.activeSubscriptions > 0 ? 'default' : 'secondary'
                    }
                  >
                    {student.activeSubscriptions > 0
                      ? t('teacherStudents.active', { default: 'Active' })
                      : t('teacherStudents.inactive', { default: 'Inactive' })}
                  </Badge>
                  {student.gender && (
                    <Badge variant='outline'>{student.gender}</Badge>
                  )}
                </div>

                {/* Next Class */}
                {student.nextClassDate && (
                  <div className='text-xs text-muted-foreground'>
                    {t('teacherStudents.nextClass', { default: 'Next class' })}:{' '}
                    {new Date(student.nextClassDate).toLocaleDateString()}
                  </div>
                )}

                {/* Actions */}
                <div className='flex gap-2 pt-2'>
                  <Button size='sm' variant='outline' className='flex-1'>
                    {t('teacherStudents.viewProgress', {
                      default: 'View Progress',
                    })}
                  </Button>
                  <Button size='sm' variant='outline' className='flex-1'>
                    {t('teacherStudents.message', { default: 'Message' })}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
