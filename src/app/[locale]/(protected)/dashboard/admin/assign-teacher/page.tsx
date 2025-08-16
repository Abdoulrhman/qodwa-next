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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  UserPlus,
  UserMinus,
  Search,
  Users,
  UserCheck,
  AlertCircle,
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
  primaryStudentCount: number;
  totalConnectionCount: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  assignedTeacher?: {
    id: string;
    name: string;
    email: string;
  };
  additionalTeachers: Array<{
    id: string;
    name: string;
    email: string;
    notes: string;
    assignedAt: string;
  }>;
}

interface AssignmentData {
  teachers: Teacher[];
  students: Student[];
  unassignedStudents: Student[];
  stats: {
    totalTeachers: number;
    totalStudents: number;
    unassignedStudents: number;
    assignedStudents: number;
  };
}

export default function TeacherAssignmentPage() {
  const [data, setData] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isPrimaryAssignment, setIsPrimaryAssignment] = useState(true);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  useEffect(() => {
    fetchAssignmentData();
  }, []);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/assign-teacher');

      if (!response.ok) {
        throw new Error('Failed to fetch assignment data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching assignment data:', error);
      toast.error('Failed to load assignment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async () => {
    if (!selectedStudent || !selectedTeacher) {
      toast.error('Please select both student and teacher');
      return;
    }

    try {
      const response = await fetch('/api/admin/assign-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: selectedTeacher,
          studentId: selectedStudent.id,
          isPrimary: isPrimaryAssignment,
          notes: assignmentNotes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign teacher');
      }

      const result = await response.json();
      toast.success(result.message);

      // Reset form
      setSelectedStudent(null);
      setSelectedTeacher('');
      setAssignmentNotes('');
      setIsPrimaryAssignment(true);
      setIsAssignDialogOpen(false);

      // Refresh data
      await fetchAssignmentData();
    } catch (error: any) {
      console.error('Error assigning teacher:', error);
      toast.error(error.message || 'Failed to assign teacher');
    }
  };

  const handleRemoveAssignment = async (
    studentId: string,
    teacherId: string,
    isPrimary: boolean = false
  ) => {
    try {
      const response = await fetch(
        `/api/admin/assign-teacher?teacherId=${teacherId}&studentId=${studentId}&removePrimary=${isPrimary}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove assignment');
      }

      toast.success('Assignment removed successfully');
      await fetchAssignmentData();
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };

  const filteredStudents =
    data?.students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const approvedTeachers = data?.teachers.filter((teacher) => teacher.id) || [];

  if (loading) {
    return (
      <RoleGate allowedRole='ADMIN'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center'>Loading...</div>
        </div>
      </RoleGate>
    );
  }

  if (!data) {
    return (
      <RoleGate allowedRole='ADMIN'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center text-red-500'>Failed to load data</div>
        </div>
      </RoleGate>
    );
  }

  return (
    <RoleGate allowedRole='ADMIN'>
      <div className='container mx-auto px-4 py-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold'>Teacher Assignment</h1>
          <p className='text-muted-foreground'>
            Assign teachers to students and manage relationships
          </p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Total Students
              </CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {data.stats.totalStudents}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Assigned Students
              </CardTitle>
              <UserCheck className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {data.stats.assignedStudents}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Unassigned Students
              </CardTitle>
              <AlertCircle className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-600'>
                {data.stats.unassignedStudents}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>
                Available Teachers
              </CardTitle>
              <Users className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {data.stats.totalTeachers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className='mb-6'>
          <CardContent className='pt-6'>
            <div className='flex flex-col md:flex-row gap-4 items-center'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search students by name or email...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-8'
                  />
                </div>
              </div>
              <Dialog
                open={isAssignDialogOpen}
                onOpenChange={setIsAssignDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button onClick={() => setIsAssignDialogOpen(true)}>
                    <UserPlus className='w-4 h-4 mr-2' />
                    Assign Teacher
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Teacher to Student</DialogTitle>
                    <DialogDescription>
                      Select a student and teacher to create a new assignment.
                    </DialogDescription>
                  </DialogHeader>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='student'>Student</Label>
                      <Select
                        onValueChange={(value) => {
                          const student = data.students.find(
                            (s) => s.id === value
                          );
                          setSelectedStudent(student || null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a student' />
                        </SelectTrigger>
                        <SelectContent>
                          {data.students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} ({student.email})
                              {student.assignedTeacher &&
                                ' - Has Primary Teacher'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='teacher'>Teacher</Label>
                      <Select onValueChange={setSelectedTeacher}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a teacher' />
                        </SelectTrigger>
                        <SelectContent>
                          {approvedTeachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name} ({teacher.primaryStudentCount}{' '}
                              students)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='assignmentType'>Assignment Type</Label>
                      <Select
                        value={isPrimaryAssignment ? 'primary' : 'additional'}
                        onValueChange={(value) =>
                          setIsPrimaryAssignment(value === 'primary')
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='primary'>
                            Primary Teacher
                          </SelectItem>
                          <SelectItem value='additional'>
                            Additional Teacher
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='notes'>Notes (Optional)</Label>
                      <Textarea
                        id='notes'
                        value={assignmentNotes}
                        onChange={(e) => setAssignmentNotes(e.target.value)}
                        placeholder='Add any notes about this assignment...'
                        className='mt-1'
                      />
                    </div>

                    <div className='flex justify-end gap-2'>
                      <Button
                        variant='outline'
                        onClick={() => {
                          setIsAssignDialogOpen(false);
                          setSelectedStudent(null);
                          setSelectedTeacher('');
                          setAssignmentNotes('');
                          setIsPrimaryAssignment(true);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAssignTeacher}
                        disabled={!selectedStudent || !selectedTeacher}
                      >
                        Assign Teacher
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Student-Teacher Assignments ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Primary Teacher</TableHead>
                  <TableHead>Additional Teachers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
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
                      {student.assignedTeacher ? (
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='secondary'
                            className='bg-green-100 text-green-800'
                          >
                            {student.assignedTeacher.name}
                          </Badge>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              handleRemoveAssignment(
                                student.id,
                                student.assignedTeacher!.id,
                                true
                              )
                            }
                            className='text-red-600 hover:text-red-700'
                          >
                            <UserMinus className='w-3 h-3' />
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-red-50 text-red-600'
                        >
                          Not Assigned
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className='space-y-1'>
                        {student.additionalTeachers.map((teacher) => (
                          <div
                            key={teacher.id}
                            className='flex items-center gap-2'
                          >
                            <Badge
                              variant='outline'
                              className='bg-blue-50 text-blue-600'
                            >
                              {teacher.name}
                            </Badge>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() =>
                                handleRemoveAssignment(student.id, teacher.id)
                              }
                              className='text-red-600 hover:text-red-700'
                            >
                              <UserMinus className='w-3 h-3' />
                            </Button>
                          </div>
                        ))}
                        {student.additionalTeachers.length === 0 && (
                          <span className='text-sm text-muted-foreground'>
                            None
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsAssignDialogOpen(true);
                        }}
                      >
                        <UserPlus className='w-4 h-4 mr-1' />
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredStudents.length === 0 && (
              <div className='text-center py-8 text-muted-foreground'>
                No students found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teachers Overview */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>Teachers Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvedTeachers.map((teacher) => (
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
                        {teacher.phone || 'No phone'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm truncate max-w-48'>
                        {teacher.subjects || 'Not specified'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm'>
                        {teacher.teachingExperience || 0} years
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGate>
  );
}
