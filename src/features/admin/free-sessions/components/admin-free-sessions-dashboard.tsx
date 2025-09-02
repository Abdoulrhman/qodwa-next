'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Calendar,
  Clock,
  User,
  BookOpen,
  Phone,
  Mail,
  MessageCircle,
  Eye,
  Edit,
  Filter,
  Search,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FreeSessionBooking {
  id: string;
  studentId: string;
  teacherId?: string | null;
  sessionDate: Date;
  duration: number;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  subject?: string | null;
  studentNotes?: string | null;
  teacherNotes?: string | null;
  meetingLink?: string | null;
  timezone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
  student?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  teacher?: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
}

export function AdminFreeSessionsDashboard() {
  const t = useTranslations('Dashboard.admin.freeSessions');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [bookings, setBookings] = useState<FreeSessionBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] =
    useState<FreeSessionBooking | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const limit = 10;

  // Fetch bookings
  const fetchBookings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/free-sessions?${params}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setBookings(data.bookings || []);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('Failed to fetch bookings:', data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, limit]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/free-sessions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: bookingId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      const result = await response.json();
      if (result.success) {
        // Refresh the bookings list
        await fetchBookings();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-800',
        label: t('status.pending'),
      },
      SCHEDULED: {
        color: 'bg-blue-100 text-blue-800',
        label: t('status.scheduled'),
      },
      COMPLETED: {
        color: 'bg-green-100 text-green-800',
        label: t('status.completed'),
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-800',
        label: t('status.cancelled'),
      },
      NO_SHOW: {
        color: 'bg-gray-100 text-gray-800',
        label: t('status.noShow'),
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={cn(config?.color, 'text-xs')}>
        {config?.label || status}
      </Badge>
    );
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      booking.student?.name?.toLowerCase().includes(searchLower) ||
      booking.student?.email?.toLowerCase().includes(searchLower) ||
      booking.subject?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('stats.total')}
            </CardTitle>
            <Calendar className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('stats.pending')}
            </CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {bookings.filter((b) => b.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('stats.scheduled')}
            </CardTitle>
            <User className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {bookings.filter((b) => b.status === 'SCHEDULED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('stats.completed')}
            </CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {bookings.filter((b) => b.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('stats.cancelled')}
            </CardTitle>
            <BookOpen className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {bookings.filter((b) => b.status === 'CANCELLED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>{t('filters.title')}</CardTitle>
          <CardDescription>{t('filters.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder={t('filters.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder={t('filters.statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>{t('filters.allStatuses')}</SelectItem>
                <SelectItem value='PENDING'>{t('status.pending')}</SelectItem>
                <SelectItem value='SCHEDULED'>
                  {t('status.scheduled')}
                </SelectItem>
                <SelectItem value='COMPLETED'>
                  {t('status.completed')}
                </SelectItem>
                <SelectItem value='CANCELLED'>
                  {t('status.cancelled')}
                </SelectItem>
                <SelectItem value='NO_SHOW'>{t('status.noShow')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4 mr-2' />
              {t('actions.export')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('table.title')}</CardTitle>
          <CardDescription>{t('table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className='text-center py-8'>
              <Calendar className='mx-auto h-12 w-12 text-muted-foreground' />
              <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                {t('table.noBookings')}
              </h3>
              <p className='mt-1 text-sm text-gray-500'>
                {t('table.noBookingsDescription')}
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.student')}</TableHead>
                    <TableHead>{t('table.sessionDate')}</TableHead>
                    <TableHead>{t('table.subject')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead>{t('table.teacher')}</TableHead>
                    <TableHead>{t('table.createdAt')}</TableHead>
                    <TableHead className='text-right'>
                      {t('table.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <div className='font-medium'>
                            {booking.student?.name}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            {booking.student?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm'>
                          {formatDate(booking.sessionDate)}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {booking.duration} min
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.subject ? (
                          <Badge variant='outline'>{booking.subject}</Badge>
                        ) : (
                          <span className='text-muted-foreground'>-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        {booking.teacher ? (
                          <div className='text-sm'>{booking.teacher.name}</div>
                        ) : (
                          <span className='text-muted-foreground'>
                            {t('table.unassigned')}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {formatDate(booking.createdAt)}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex items-center gap-2 justify-end'>
                          <Select
                            value={booking.status}
                            onValueChange={(newStatus) =>
                              updateBookingStatus(booking.id, newStatus)
                            }
                            disabled={isUpdating}
                          >
                            <SelectTrigger className='w-32'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='PENDING'>
                                {t('status.pending')}
                              </SelectItem>
                              <SelectItem value='SCHEDULED'>
                                {t('status.scheduled')}
                              </SelectItem>
                              <SelectItem value='COMPLETED'>
                                {t('status.completed')}
                              </SelectItem>
                              <SelectItem value='CANCELLED'>
                                {t('status.cancelled')}
                              </SelectItem>
                              <SelectItem value='NO_SHOW'>
                                {t('status.noShow')}
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className='h-4 w-4' />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='max-w-2xl'>
                              <DialogHeader>
                                <DialogTitle>{t('details.title')}</DialogTitle>
                                <DialogDescription>
                                  {t('details.description')}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className='space-y-4'>
                                  <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                      <h4 className='font-semibold mb-2'>
                                        {t('details.student')}
                                      </h4>
                                      <div className='space-y-1 text-sm'>
                                        <div className='flex items-center gap-2'>
                                          <User className='h-4 w-4' />
                                          {selectedBooking.student?.name}
                                        </div>
                                        <div className='flex items-center gap-2'>
                                          <Mail className='h-4 w-4' />
                                          {selectedBooking.student?.email}
                                        </div>
                                        {selectedBooking.student?.phone && (
                                          <div className='flex items-center gap-2'>
                                            <Phone className='h-4 w-4' />
                                            {selectedBooking.student.phone}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className='font-semibold mb-2'>
                                        {t('details.session')}
                                      </h4>
                                      <div className='space-y-1 text-sm'>
                                        <div className='flex items-center gap-2'>
                                          <Calendar className='h-4 w-4' />
                                          {formatDate(
                                            selectedBooking.sessionDate
                                          )}
                                        </div>
                                        <div className='flex items-center gap-2'>
                                          <Clock className='h-4 w-4' />
                                          {selectedBooking.duration} minutes
                                        </div>
                                        <div className='flex items-center gap-2'>
                                          <BookOpen className='h-4 w-4' />
                                          {selectedBooking.subject ||
                                            'Not specified'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedBooking.studentNotes && (
                                    <div>
                                      <h4 className='font-semibold mb-2'>
                                        {t('details.studentNotes')}
                                      </h4>
                                      <p className='text-sm bg-muted p-3 rounded'>
                                        {selectedBooking.studentNotes}
                                      </p>
                                    </div>
                                  )}
                                  {selectedBooking.teacher && (
                                    <div>
                                      <h4 className='font-semibold mb-2'>
                                        {t('details.teacher')}
                                      </h4>
                                      <div className='space-y-1 text-sm'>
                                        <div className='flex items-center gap-2'>
                                          <User className='h-4 w-4' />
                                          {selectedBooking.teacher.name}
                                        </div>
                                        <div className='flex items-center gap-2'>
                                          <Mail className='h-4 w-4' />
                                          {selectedBooking.teacher.email}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages}
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
