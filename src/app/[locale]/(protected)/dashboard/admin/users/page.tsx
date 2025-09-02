'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RoleGate } from '@/features/auth/components/role-gate';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  Shield,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Crown,
  GraduationCap,
  User,
} from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  isTeacher: boolean | null;
  teacherApprovalStatus: string | null;
  teacherApprovedAt: Date | null;
  emailVerified: Date | null;
  phone: string | null;
  gender: string | null;
  birthDate: Date | null;
  qualifications: string | null;
  subjects: string | null;
  teachingExperience: number | null;
  referralSource: string | null;
  hasBookedDemo: boolean;
  demoSessionDate: Date | null;
  assignedTeacherId: string | null;
  _count: {
    assignedStudents: number;
    teacherConnections: number;
    studentConnections: number;
    subscriptions: number;
  };
}

interface UserStats {
  totalUsers: number;
  totalAdmins: number;
  totalTeachers: number;
  totalStudents: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  pendingTeachers: number;
  approvedTeachers: number;
  rejectedTeachers: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export default function AdminUsersPage() {
  const t = useTranslations('Admin');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [rejectReason, setRejectReason] = useState('');

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        });

        if (searchTerm) params.append('search', searchTerm);
        if (roleFilter !== 'ALL') params.append('role', roleFilter);
        if (statusFilter !== 'ALL') params.append('status', statusFilter);

        const response = await fetch(`/api/admin/users?${params}`);
        const data = await response.json();

        if (response.ok) {
          setUsers(data.users);
          setStats(data.stats);
          setPagination(data.pagination);
        } else {
          toast.error(data.error || 'Failed to fetch users');
        }
      } catch (error) {
        toast.error('Error fetching users');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, roleFilter, statusFilter, pagination.limit]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserAction = async (
    userId: string,
    action: string,
    data?: any
  ) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          data,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        fetchUsers(pagination.currentPage);
        setDialogOpen(false);
        setSelectedUser(null);
        setRejectReason('');
      } else {
        toast.error(result.error || 'Action failed');
      }
    } catch (error) {
      toast.error('Error performing action');
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this user? This action cannot be undone.'
      )
    ) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        fetchUsers(pagination.currentPage);
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
      console.error('Error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getUserBadgeColor = (user: User) => {
    if (user.role === 'ADMIN') return 'bg-purple-100 text-purple-800';
    if (user.isTeacher) {
      switch (user.teacherApprovalStatus) {
        case 'APPROVED':
          return 'bg-green-100 text-green-800';
        case 'REJECTED':
          return 'bg-red-100 text-red-800';
        case 'PENDING':
          return 'bg-yellow-100 text-yellow-800';
        default:
          return 'bg-blue-100 text-blue-800';
      }
    }
    return 'bg-blue-100 text-blue-800';
  };

  const getUserBadgeText = (user: User) => {
    if (user.role === 'ADMIN') return 'Admin';
    if (user.isTeacher) {
      switch (user.teacherApprovalStatus) {
        case 'APPROVED':
          return 'Approved Teacher';
        case 'REJECTED':
          return 'Rejected Teacher';
        case 'PENDING':
          return 'Pending Teacher';
        default:
          return 'Teacher';
      }
    }
    return 'Student';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const openActionDialog = (user: User, action: string) => {
    setSelectedUser(user);
    setActionType(action);
    setDialogOpen(true);
  };

  return (
    <RoleGate allowedRole='ADMIN'>
      <div className='container mx-auto py-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>User Management</h1>
            <p className='text-muted-foreground'>
              Manage all registered users, teachers, and students
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Users className='h-4 w-4 text-blue-600' />
                  <div>
                    <p className='text-2xl font-bold'>{stats.totalUsers}</p>
                    <p className='text-xs text-muted-foreground'>Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Crown className='h-4 w-4 text-purple-600' />
                  <div>
                    <p className='text-2xl font-bold'>{stats.totalAdmins}</p>
                    <p className='text-xs text-muted-foreground'>Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <GraduationCap className='h-4 w-4 text-green-600' />
                  <div>
                    <p className='text-2xl font-bold'>{stats.totalTeachers}</p>
                    <p className='text-xs text-muted-foreground'>Teachers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <User className='h-4 w-4 text-blue-600' />
                  <div>
                    <p className='text-2xl font-bold'>{stats.totalStudents}</p>
                    <p className='text-xs text-muted-foreground'>Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Clock className='h-4 w-4 text-yellow-600' />
                  <div>
                    <p className='text-2xl font-bold'>
                      {stats.pendingTeachers}
                    </p>
                    <p className='text-xs text-muted-foreground'>Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Filter className='h-5 w-5' />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search by name, email, or phone...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-8'
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className='w-full md:w-48'>
                  <SelectValue placeholder='Filter by role' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Roles</SelectItem>
                  <SelectItem value='ADMIN'>Admins</SelectItem>
                  <SelectItem value='TEACHER'>Teachers</SelectItem>
                  <SelectItem value='USER'>Students</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-full md:w-48'>
                  <SelectValue placeholder='Filter by status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>All Status</SelectItem>
                  <SelectItem value='VERIFIED'>Verified</SelectItem>
                  <SelectItem value='UNVERIFIED'>Unverified</SelectItem>
                  <SelectItem value='TEACHER_PENDING'>
                    Pending Teachers
                  </SelectItem>
                  <SelectItem value='TEACHER_APPROVED'>
                    Approved Teachers
                  </SelectItem>
                  <SelectItem value='TEACHER_REJECTED'>
                    Rejected Teachers
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({pagination.totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex items-center justify-center p-8'>
                <div className='text-muted-foreground'>Loading users...</div>
              </div>
            ) : (
              <>
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role/Status</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Stats</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className='font-medium'>
                                {user.name || 'No Name'}
                              </div>
                              <div className='text-sm text-muted-foreground'>
                                {user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getUserBadgeColor(user)}>
                              {getUserBadgeText(user)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className='text-sm'>
                              {user.phone && (
                                <div className='flex items-center space-x-1'>
                                  <Phone className='h-3 w-3' />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                              {user.gender && (
                                <div className='text-muted-foreground'>
                                  {user.gender}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {user.emailVerified ? (
                              <Badge
                                variant='secondary'
                                className='bg-green-100 text-green-800'
                              >
                                <CheckCircle className='h-3 w-3 mr-1' />
                                Verified
                              </Badge>
                            ) : (
                              <Badge
                                variant='secondary'
                                className='bg-red-100 text-red-800'
                              >
                                <XCircle className='h-3 w-3 mr-1' />
                                Unverified
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className='text-sm'>
                              {user.isTeacher && (
                                <div>
                                  Students: {user._count.assignedStudents}
                                </div>
                              )}
                              <div>
                                Subscriptions: {user._count.subscriptions}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='text-sm text-muted-foreground'>
                              {formatDate(user.emailVerified)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' className='h-8 w-8 p-0'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => openActionDialog(user, 'VIEW')}
                                >
                                  <Eye className='mr-2 h-4 w-4' />
                                  View Details
                                </DropdownMenuItem>

                                {!user.emailVerified && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUserAction(user.id, 'VERIFY_EMAIL')
                                    }
                                  >
                                    <UserCheck className='mr-2 h-4 w-4' />
                                    Verify Email
                                  </DropdownMenuItem>
                                )}

                                {user.isTeacher &&
                                  user.teacherApprovalStatus === 'PENDING' && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleUserAction(
                                            user.id,
                                            'APPROVE_TEACHER'
                                          )
                                        }
                                      >
                                        <CheckCircle className='mr-2 h-4 w-4' />
                                        Approve Teacher
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          openActionDialog(
                                            user,
                                            'REJECT_TEACHER'
                                          )
                                        }
                                      >
                                        <XCircle className='mr-2 h-4 w-4' />
                                        Reject Teacher
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    openActionDialog(user, 'UPDATE_ROLE')
                                  }
                                >
                                  <Shield className='mr-2 h-4 w-4' />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user.id)}
                                  className='text-red-600'
                                >
                                  <Trash2 className='mr-2 h-4 w-4' />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className='flex items-center justify-between mt-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing{' '}
                    {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                    {Math.min(
                      pagination.currentPage * pagination.limit,
                      pagination.totalCount
                    )}{' '}
                    of {pagination.totalCount} users
                  </div>
                  <div className='flex space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => fetchUsers(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => fetchUsers(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'VIEW' && 'User Details'}
                {actionType === 'REJECT_TEACHER' &&
                  'Reject Teacher Application'}
                {actionType === 'UPDATE_ROLE' && 'Change User Role'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'VIEW' && 'Detailed information about the user'}
                {actionType === 'REJECT_TEACHER' &&
                  'Provide a reason for rejecting this teacher application'}
                {actionType === 'UPDATE_ROLE' && 'Change the role of this user'}
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className='space-y-4'>
                {actionType === 'VIEW' && (
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label>Name</Label>
                      <p className='text-sm'>{selectedUser.name || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className='text-sm'>{selectedUser.email || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className='text-sm'>{selectedUser.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Gender</Label>
                      <p className='text-sm'>{selectedUser.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <Label>Birth Date</Label>
                      <p className='text-sm'>
                        {formatDate(selectedUser.birthDate)}
                      </p>
                    </div>
                    <div>
                      <Label>Role</Label>
                      <p className='text-sm'>{selectedUser.role}</p>
                    </div>
                    {selectedUser.isTeacher && (
                      <>
                        <div>
                          <Label>Teaching Experience</Label>
                          <p className='text-sm'>
                            {selectedUser.teachingExperience || 0} years
                          </p>
                        </div>
                        <div>
                          <Label>Subjects</Label>
                          <p className='text-sm'>
                            {selectedUser.subjects || 'N/A'}
                          </p>
                        </div>
                        <div className='col-span-2'>
                          <Label>Qualifications</Label>
                          <p className='text-sm'>
                            {selectedUser.qualifications || 'N/A'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {actionType === 'REJECT_TEACHER' && (
                  <div>
                    <Label htmlFor='reason'>Rejection Reason</Label>
                    <Textarea
                      id='reason'
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder='Please provide a reason for rejecting this teacher application...'
                      rows={4}
                    />
                  </div>
                )}

                {actionType === 'UPDATE_ROLE' && (
                  <div>
                    <Label>New Role</Label>
                    <Select onValueChange={(value) => setRejectReason(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select new role' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='USER'>Student</SelectItem>
                        <SelectItem value='TEACHER'>Teacher</SelectItem>
                        <SelectItem value='ADMIN'>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant='outline' onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              {actionType === 'REJECT_TEACHER' && (
                <Button
                  onClick={() =>
                    handleUserAction(selectedUser!.id, 'REJECT_TEACHER', {
                      reason: rejectReason,
                    })
                  }
                  disabled={!rejectReason.trim() || actionLoading}
                  variant='destructive'
                >
                  {actionLoading ? 'Rejecting...' : 'Reject Teacher'}
                </Button>
              )}
              {actionType === 'UPDATE_ROLE' && (
                <Button
                  onClick={() =>
                    handleUserAction(selectedUser!.id, 'UPDATE_ROLE', {
                      role: rejectReason,
                    })
                  }
                  disabled={!rejectReason || actionLoading}
                >
                  {actionLoading ? 'Updating...' : 'Update Role'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGate>
  );
}
