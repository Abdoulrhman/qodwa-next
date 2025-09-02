'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface ClassNote {
  id: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: string;
  dailyAssignment?: string;
  appliedTajweed?: string;
  review?: string;
  memorization?: string;
  notes?: string;
}

interface StudentNotesDialogProps {
  student: {
    id: string;
    name: string;
  };
  trigger: React.ReactNode;
}

export const StudentNotesDialog = ({
  student,
  trigger,
}: StudentNotesDialogProps) => {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [classNotes, setClassNotes] = useState<ClassNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    dailyAssignment: '',
    appliedTajweed: '',
    review: '',
    memorization: '',
    notes: '',
  });

  const fetchClassNotes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/students/${student.id}/notes`);
      if (response.ok) {
        const data = await response.json();
        setClassNotes(data);
      }
    } catch (error) {
      console.error('Failed to fetch class notes:', error);
      toast.error(t('teacherStudents.classNotes.notesError'));
    } finally {
      setLoading(false);
    }
  }, [student.id, t]);

  useEffect(() => {
    if (open) {
      fetchClassNotes();
    }
  }, [open, fetchClassNotes]);

  const handleEditStart = (note: ClassNote) => {
    setEditingNote(note.id);
    setEditForm({
      dailyAssignment: note.dailyAssignment || '',
      appliedTajweed: note.appliedTajweed || '',
      review: note.review || '',
      memorization: note.memorization || '',
      notes: note.notes || '',
    });
  };

  const handleEditCancel = () => {
    setEditingNote(null);
    setEditForm({
      dailyAssignment: '',
      appliedTajweed: '',
      review: '',
      memorization: '',
      notes: '',
    });
  };

  const handleSaveNotes = async (classId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/students/${student.id}/notes/${classId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm),
        }
      );

      if (response.ok) {
        toast.success(t('teacherStudents.classNotes.notesUpdated'));
        setEditingNote(null);
        fetchClassNotes(); // Refresh the notes
      } else {
        toast.error(t('teacherStudents.classNotes.notesError'));
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
      toast.error(t('teacherStudents.classNotes.notesError'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to calculate actual duration
  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) {
      return 'Ongoing';
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMs = end.getTime() - start.getTime();
    const diffInMinutes = Math.round(diffInMs / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  };

  // Format duration helper
  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0
        ? `${hours}h ${remainingMinutes}m`
        : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      COMPLETED: { variant: 'default' as const, label: 'Completed' },
      IN_PROGRESS: { variant: 'secondary' as const, label: 'In Progress' },
      SCHEDULED: { variant: 'outline' as const, label: 'Scheduled' },
      CANCELLED: { variant: 'destructive' as const, label: 'Cancelled' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      variant: 'outline' as const,
      label: status,
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5' />
            {t('teacherStudents.classNotes.title')} - {student.name}
          </DialogTitle>
          <DialogDescription>
            Track daily assignments, tajweed practice, review, and memorization
            progress
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 max-h-[60vh] overflow-y-auto'>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : classNotes.length === 0 ? (
            <Card>
              <CardContent className='text-center py-8'>
                <p className='text-muted-foreground'>
                  {t('teacherStudents.classNotes.noNotes')}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className='space-y-4'>
              {classNotes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-4'>
                          <CardTitle className='text-base'>
                            {formatDate(note.startTime)}
                          </CardTitle>
                          {getStatusBadge(note.status)}
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground'>
                          <div>
                            <span className='font-medium'>Start:</span>{' '}
                            {formatTime(note.startTime)}
                          </div>
                          {note.endTime && (
                            <div>
                              <span className='font-medium'>End:</span>{' '}
                              {formatTime(note.endTime)}
                            </div>
                          )}
                          <div>
                            <span className='font-medium'>Duration:</span>{' '}
                            {calculateDuration(note.startTime, note.endTime)}
                          </div>
                        </div>
                      </div>
                      <div className='flex gap-2'>
                        {editingNote === note.id ? (
                          <>
                            <Button
                              size='sm'
                              onClick={() => handleSaveNotes(note.id)}
                            >
                              <Save className='h-3 w-3 mr-1' />
                              {t('teacherStudents.classNotes.saveNotes')}
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={handleEditCancel}
                            >
                              <X className='h-3 w-3 mr-1' />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => handleEditStart(note)}
                          >
                            <Edit className='h-3 w-3 mr-1' />
                            {t('teacherStudents.classNotes.editNotes')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingNote === note.id ? (
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label>
                            {t('teacherStudents.classNotes.dailyAssignment')}
                          </Label>
                          <Textarea
                            value={editForm.dailyAssignment}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                dailyAssignment: e.target.value,
                              }))
                            }
                            placeholder='Enter daily assignment notes...'
                            rows={3}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>
                            {t('teacherStudents.classNotes.appliedTajweed')}
                          </Label>
                          <Textarea
                            value={editForm.appliedTajweed}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                appliedTajweed: e.target.value,
                              }))
                            }
                            placeholder='Enter applied tajweed notes...'
                            rows={3}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>
                            {t('teacherStudents.classNotes.review')}
                          </Label>
                          <Textarea
                            value={editForm.review}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                review: e.target.value,
                              }))
                            }
                            placeholder='Enter review notes...'
                            rows={3}
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>
                            {t('teacherStudents.classNotes.memorization')}
                          </Label>
                          <Textarea
                            value={editForm.memorization}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                memorization: e.target.value,
                              }))
                            }
                            placeholder='Enter memorization notes...'
                            rows={3}
                          />
                        </div>
                        <div className='space-y-2 md:col-span-2'>
                          <Label>Additional Notes</Label>
                          <Textarea
                            value={editForm.notes}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            placeholder='Enter additional class notes...'
                            rows={2}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className='space-y-3'>
                        {note.dailyAssignment ||
                        note.appliedTajweed ||
                        note.review ||
                        note.memorization ||
                        note.notes ? (
                          <>
                            {/* Show notes in a clean card layout */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              {note.dailyAssignment && (
                                <div className='p-3 bg-muted rounded-md'>
                                  <div className='text-sm font-medium text-muted-foreground mb-1'>
                                    {t(
                                      'teacherStudents.classNotes.dailyAssignment'
                                    )}
                                  </div>
                                  <div className='text-sm'>
                                    {note.dailyAssignment}
                                  </div>
                                </div>
                              )}
                              {note.appliedTajweed && (
                                <div className='p-3 bg-muted rounded-md'>
                                  <div className='text-sm font-medium text-muted-foreground mb-1'>
                                    {t(
                                      'teacherStudents.classNotes.appliedTajweed'
                                    )}
                                  </div>
                                  <div className='text-sm'>
                                    {note.appliedTajweed}
                                  </div>
                                </div>
                              )}
                              {note.review && (
                                <div className='p-3 bg-muted rounded-md'>
                                  <div className='text-sm font-medium text-muted-foreground mb-1'>
                                    {t('teacherStudents.classNotes.review')}
                                  </div>
                                  <div className='text-sm'>{note.review}</div>
                                </div>
                              )}
                              {note.memorization && (
                                <div className='p-3 bg-muted rounded-md'>
                                  <div className='text-sm font-medium text-muted-foreground mb-1'>
                                    {t(
                                      'teacherStudents.classNotes.memorization'
                                    )}
                                  </div>
                                  <div className='text-sm'>
                                    {note.memorization}
                                  </div>
                                </div>
                              )}
                            </div>
                            {note.notes && (
                              <div className='p-3 bg-muted rounded-md'>
                                <div className='text-sm font-medium text-muted-foreground mb-1'>
                                  Additional Notes
                                </div>
                                <div className='text-sm'>{note.notes}</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className='text-center py-8 text-muted-foreground'>
                            <div className='text-sm'>
                              No notes have been added for this class session
                              yet.
                            </div>
                            <div className='text-xs mt-1'>
                              Click &quot;Edit Notes&quot; to add class notes
                              for this session.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
