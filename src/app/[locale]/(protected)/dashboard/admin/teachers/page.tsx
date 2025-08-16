'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { RoleGate } from '@/features/auth/components/role-gate';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  UserCheck,
  UserX,
  Eye,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subjects?: string;
  qualifications?: string;
  teachingExperience?: number;
  teacherApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  teacherApprovedAt?: string;
  teacherRejectedReason?: string;
  createdAt: string;
  primaryStudentCount: number;
  totalConnectionCount: number;
}

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('ALL');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/teachers');

      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTeacher = async (teacherId: string) => {
    try {
      const response = await fetch('/api/admin/teachers/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve teacher');
      }

      toast.success('Teacher approved successfully');
      await fetchTeachers();
    } catch (error) {
      console.error('Error approving teacher:', error);
      toast.error('Failed to approve teacher');
    }
  };

  const handleRejectTeacher = async (teacherId: string, reason: string) => {
    try {
      const response = await fetch('/api/admin/teachers/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teacherId, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject teacher');
      }

      toast.success('Teacher rejected');
      setRejectionReason('');
      setIsDialogOpen(false);
      await fetchTeachers();
    } catch (error) {
      console.error('Error rejecting teacher:', error);
      toast.error('Failed to reject teacher');
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || teacher.teacherApprovalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>
            <Clock className='w-3 h-3 mr-1' />
            Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant='secondary' className='bg-green-100 text-green-800'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant='secondary' className='bg-red-100 text-red-800'>
            <XCircle className='w-3 h-3 mr-1' />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  const pendingCount = teachers.filter(
    (t) => t.teacherApprovalStatus === 'PENDING'
  ).length;
  const approvedCount = teachers.filter(
    (t) => t.teacherApprovalStatus === 'APPROVED'
  ).length;
  const rejectedCount = teachers.filter(
    (t) => t.teacherApprovalStatus === 'REJECTED'
  ).length;

  if (loading) {
    return (
      <RoleGate allowedRole='ADMIN'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center'>Loading...</div>
        </div>
      </RoleGate>
    );
  }

  return (
    <RoleGate allowedRole='ADMIN'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Teacher Management</h1>
          <p className='text-muted-foreground'>
            Review and manage teacher applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Teachers
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{teachers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Pending Review
              </CardTitle>
              <Clock className='h-4 w-4 text-yellow-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>
                {pendingCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Approved</CardTitle>
              <CheckCircle className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {approvedCount}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Rejected</CardTitle>
              <XCircle className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {rejectedCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search by name or email...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-8'
                  />
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Filter className='h-4 w-4 text-muted-foreground' />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className='border border-gray-300 rounded-md px-3 py-2'
                >
                  <option value='ALL'>All Status</option>
                  <option value='PENDING'>Pending</option>
                  <option value='APPROVED'>Approved</option>
                  <option value='REJECTED'>Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers ({filteredTeachers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell>
                      <div>
                        <div className='font-medium'>{teacher.name}</div>
                        <div className='text-sm text-muted-foreground'>
                          {teacher.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div>{teacher.phone || 'No phone'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div>{teacher.teachingExperience || 0} years</div>
                        <div className='text-muted-foreground truncate max-w-32'>
                          {teacher.subjects || 'No subjects listed'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        <div>{teacher.primaryStudentCount} primary</div>
                        <div className='text-muted-foreground'>
                          {teacher.totalConnectionCount} total
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(teacher.teacherApprovalStatus)}
                    </TableCell>
                    <TableCell>
                      <div className='text-sm text-muted-foreground'>
                        {new Date(teacher.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center gap-2'>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setSelectedTeacher(teacher)}
                            >
                              <Eye className='w-4 h-4' />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className='max-w-2xl'>
                            <DialogHeader>
                              <DialogTitle>Teacher Details</DialogTitle>
                              <DialogDescription>
                                Review teacher application details
                              </DialogDescription>
                            </DialogHeader>
                            {selectedTeacher && (
                              <div className='space-y-4'>
                                <div className='grid grid-cols-2 gap-4'>
                                  <div>
                                    <Label>Name</Label>
                                    <div className='font-medium'>
                                      {selectedTeacher.name}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <div>{selectedTeacher.email}</div>
                                  </div>
                                  <div>
                                    <Label>Phone</Label>
                                    <div>
                                      {selectedTeacher.phone || 'Not provided'}
                                    </div>
                                  </div>
                                  <div>
                                    <Label>Experience</Label>
                                    <div>
                                      {selectedTeacher.teachingExperience || 0}{' '}
                                      years
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <Label>Subjects</Label>
                                  <div className='mt-1'>
                                    {selectedTeacher.subjects ||
                                      'Not specified'}
                                  </div>
                                </div>
                                <div>
                                  <Label>Qualifications</Label>
                                  <div className='mt-1'>
                                    {selectedTeacher.qualifications ||
                                      'Not provided'}
                                  </div>
                                </div>
                                <div>
                                  <Label>Current Status</Label>
                                  <div className='mt-1'>
                                    {getStatusBadge(
                                      selectedTeacher.teacherApprovalStatus
                                    )}
                                  </div>
                                </div>
                                {selectedTeacher.teacherRejectedReason && (
                                  <div>
                                    <Label>Rejection Reason</Label>
                                    <div className='mt-1 text-red-600'>
                                      {selectedTeacher.teacherRejectedReason}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {teacher.teacherApprovalStatus === 'PENDING' && (
                          <>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => handleApproveTeacher(teacher.id)}
                              className='text-green-600 hover:text-green-700'
                            >
                              <UserCheck className='w-4 h-4' />
                            </Button>
                            <Dialog
                              open={isDialogOpen}
                              onOpenChange={setIsDialogOpen}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => {
                                    setSelectedTeacher(teacher);
                                    setIsDialogOpen(true);
                                  }}
                                  className='text-red-600 hover:text-red-700'
                                >
                                  <UserX className='w-4 h-4' />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Reject Teacher Application
                                  </DialogTitle>
                                  <DialogDescription>
                                    Please provide a reason for rejecting{' '}
                                    {selectedTeacher?.name}&apos;s application.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className='space-y-4'>
                                  <div>
                                    <Label htmlFor='reason'>
                                      Rejection Reason
                                    </Label>
                                    <Textarea
                                      id='reason'
                                      value={rejectionReason}
                                      onChange={(e) =>
                                        setRejectionReason(e.target.value)
                                      }
                                      placeholder='Please explain why this application is being rejected...'
                                      className='mt-1'
                                    />
                                  </div>
                                  <div className='flex justify-end gap-2'>
                                    <Button
                                      variant='outline'
                                      onClick={() => {
                                        setIsDialogOpen(false);
                                        setRejectionReason('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      variant='destructive'
                                      onClick={() =>
                                        selectedTeacher &&
                                        handleRejectTeacher(
                                          selectedTeacher.id,
                                          rejectionReason
                                        )
                                      }
                                      disabled={!rejectionReason.trim()}
                                    >
                                      Reject Application
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTeachers.length === 0 && (
              <div className='text-center py-8 text-muted-foreground'>
                No teachers found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
