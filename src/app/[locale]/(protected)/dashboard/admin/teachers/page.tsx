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
  UserPlus,
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

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  assignedTeacherId?: string;
}

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('ALL');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [teacherForAssignment, setTeacherForAssignment] = useState<Teacher | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
    fetchStudents();
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

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/users?role=USER');

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      console.log('Fetched students:', data);
      setStudents(data.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
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

  const handleAssignStudents = async () => {
    if (!teacherForAssignment || selectedStudentIds.length === 0) {
      toast.error('Please select students to assign');
      return;
    }

    try {
      const response = await fetch('/api/admin/student-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: teacherForAssignment.id,
          studentIds: selectedStudentIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign students');
      }

      toast.success(`Successfully assigned ${selectedStudentIds.length} student(s) to ${teacherForAssignment.name}`);
      setIsAssignDialogOpen(false);
      setSelectedStudentIds([]);
      setTeacherForAssignment(null);
      await fetchTeachers();
      await fetchStudents();
    } catch (error) {
      console.error('Error assigning students:', error);
      toast.error('Failed to assign students');
    }
  };

  const openAssignDialog = (teacher: Teacher) => {
    setTeacherForAssignment(teacher);
    setIsAssignDialogOpen(true);
    setSelectedStudentIds([]);
    setStudentSearchTerm('');
    // Refresh students data when dialog opens
    fetchStudents();
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || teacher.teacherApprovalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearchTerm.toLowerCase());
    return matchesSearch;
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

                        {teacher.teacherApprovalStatus === 'APPROVED' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => openAssignDialog(teacher)}
                            className='text-blue-600 hover:text-blue-700'
                          >
                            <UserPlus className='w-4 h-4' />
                          </Button>
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

        {/* Student Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Assign Students to {teacherForAssignment?.name}</DialogTitle>
              <DialogDescription>
                Select students to assign to this teacher. You can assign multiple students at once.
              </DialogDescription>
            </DialogHeader>
            
            <div className='space-y-4'>
              {/* Search Students */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Search students by name or email...'
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>

              {/* Selected Students Count */}
              {selectedStudentIds.length > 0 && (
                <div className='bg-blue-50 p-3 rounded-lg'>
                  <p className='text-sm text-blue-700'>
                    {selectedStudentIds.length} student(s) selected for assignment
                  </p>
                </div>
              )}

              {/* Students List */}
              <div className='border rounded-lg max-h-96 overflow-y-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-12'>Select</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Current Teacher</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <input
                            type='checkbox'
                            checked={selectedStudentIds.includes(student.id)}
                            onChange={() => handleStudentSelection(student.id)}
                            className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className='font-medium'>{student.name}</div>
                            <div className='text-sm text-muted-foreground'>
                              {student.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            {student.phone || 'No phone'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm'>
                            {student.assignedTeacherId ? (
                              <Badge variant='secondary'>Assigned</Badge>
                            ) : (
                              <Badge variant='outline'>Unassigned</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm text-muted-foreground'>
                            {new Date(student.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {filteredStudents.length === 0 && (
                  <div className='text-center py-8 text-muted-foreground'>
                    No students found matching your search.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-2 pt-4 border-t'>
                <Button
                  variant='outline'
                  onClick={() => {
                    setIsAssignDialogOpen(false);
                    setSelectedStudentIds([]);
                    setTeacherForAssignment(null);
                    setStudentSearchTerm('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAssignStudents}
                  disabled={selectedStudentIds.length === 0}
                  className='bg-blue-600 hover:bg-blue-700'
                >
                  Assign {selectedStudentIds.length} Student(s)
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGate>
  );
}
