# Admin User Management Module

## Overview

This module provides comprehensive user management functionality for administrators, including user listing, filtering, role management, and automated email notifications for new registrations.

## Features

### 1. User Management Dashboard

- **Complete user listing** with pagination and filtering
- **Advanced search** by name, email, or phone number
- **Role-based filtering** (Admins, Teachers, Students)
- **Status filtering** (Verified, Unverified, Teacher approval status)
- **User statistics** with visual metrics

### 2. User Actions

- **View detailed user information**
- **Update user roles** (Student → Teacher → Admin)
- **Email verification management**
- **Teacher approval/rejection** with reasons
- **User deletion** with safety checks
- **Profile updates**

### 3. Email Notifications

- **Automatic admin notifications** for new registrations
- **Separate notifications** for student and teacher registrations
- **Teacher approval reminders**
- **Customizable email templates**

## API Endpoints

### `/api/admin/users`

#### GET - Fetch Users

Query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role (ALL, ADMIN, TEACHER, USER)
- `status`: Filter by status (ALL, VERIFIED, UNVERIFIED, TEACHER_PENDING, etc.)
- `search`: Search term for name, email, or phone

Response:

```json
{
  "users": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10
  },
  "stats": {
    "totalUsers": 150,
    "totalAdmins": 3,
    "totalTeachers": 25,
    "totalStudents": 122,
    "verifiedUsers": 140,
    "unverifiedUsers": 10,
    "pendingTeachers": 5,
    "approvedTeachers": 20,
    "rejectedTeachers": 0
  }
}
```

#### PUT - Update User

Actions supported:

- `UPDATE_ROLE`: Change user role
- `VERIFY_EMAIL`: Mark email as verified
- `UNVERIFY_EMAIL`: Mark email as unverified
- `APPROVE_TEACHER`: Approve teacher application
- `REJECT_TEACHER`: Reject teacher application with reason
- `RESET_TEACHER_STATUS`: Reset teacher approval status
- `UPDATE_PROFILE`: Update basic profile information

#### DELETE - Delete User

Query parameter: `userId`

### `/api/admin/notifications`

#### GET - Get Notification Settings

Returns current email notification configuration.

#### POST - Send Test Notification

Send test email notification to verify setup.

## Pages

### `/dashboard/admin/users`

Main user management interface with:

- Statistics cards showing user counts
- Advanced filtering options
- Sortable data table
- Action dropdown menus
- User detail modals
- Bulk actions support

## Environment Variables

Add these to your `.env` file:

```env
# Admin Email Notifications
ADMIN_NOTIFICATION_EMAIL="abdoulrhman_salah@hotmail.com"

# Email Service (already configured in your project)
RESEND_API_KEY="your-resend-api-key"
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Base URL for email links
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Note: The email notifications use Resend service which is already configured in your project, so no additional SMTP setup is required.

## Email Templates

### Student Registration

- **Subject**: "New Student Registration - [Name/Email]"
- **Content**: Basic user information with admin panel link
- **Color Scheme**: Blue theme

### Teacher Registration

- **Subject**: "New Teacher Registration - [Name/Email]"
- **Content**: Complete teacher information including qualifications
- **Action Required**: Review and approval needed
- **Color Scheme**: Green theme

### Teacher Approval Required

- **Subject**: "Teacher Approval Required - [Name/Email]"
- **Content**: Urgent notification for pending approvals
- **Color Scheme**: Red theme (urgent)

## Usage Instructions

### 1. Access User Management

1. Log in as an admin user
2. Navigate to **Admin → User Management** in the sidebar
3. View user statistics and manage users

### 2. Filter and Search Users

- Use the search bar to find specific users
- Apply role filters (Admin, Teacher, Student)
- Apply status filters (Verified, Unverified, Pending Teachers)

### 3. Manage User Roles

1. Click the action menu (⋮) for any user
2. Select "Change Role"
3. Choose new role from dropdown
4. Confirm the change

### 4. Teacher Approval Process

1. Filter for "Pending Teachers"
2. Review teacher qualifications and experience
3. Either approve or reject with a reason
4. Teacher receives email notification of decision

### 5. Email Notifications Setup

1. Configure SMTP settings in environment variables
2. Test notifications via `/api/admin/notifications`
3. Automatic notifications are sent for all new registrations

## Database Schema

The module works with the existing User model:

```prisma
model User {
  id                    String                 @id @default(cuid())
  name                  String?
  email                 String?                @unique
  emailVerified         DateTime?
  role                  UserRole               @default(USER)
  isTeacher             Boolean?               @default(false)
  teacherApprovalStatus TeacherApprovalStatus? @default(PENDING)
  teacherApprovedAt     DateTime?
  teacherApprovedBy     String?
  teacherRejectedReason String?
  phone                 String?
  qualifications        String?
  subjects              String?
  teachingExperience    Int?
  // ... other fields
}
```

## Security Features

- **Admin-only access** with role validation
- **Prevention of self-deletion** for admins
- **Secure password handling** with bcrypt
- **SQL injection protection** with Prisma
- **Input validation** with Zod schemas

## Translations

The module supports internationalization with English and Arabic translations:

### English Keys

```json
{
  "navigation.admin.users": "User Management",
  "admin.users.title": "User Management",
  "admin.users.description": "Manage all registered users"
}
```

### Arabic Keys

```json
{
  "navigation.admin.users": "إدارة المستخدمين",
  "admin.users.title": "إدارة المستخدمين",
  "admin.users.description": "إدارة جميع المستخدمين المسجلين"
}
```

## Troubleshooting

### Email Notifications Not Working

1. Check SMTP credentials in `.env.local`
2. Verify SMTP server settings
3. Test with `/api/admin/notifications` endpoint
4. Check server logs for email errors

### Users Not Loading

1. Verify admin role assignment
2. Check database connection
3. Review API endpoint logs
4. Ensure proper authentication

### Permission Denied

1. Confirm user has ADMIN role
2. Check authentication status
3. Verify session is active

## Future Enhancements

- **Bulk user operations** (approve multiple teachers)
- **User import/export** functionality
- **Advanced analytics** and reporting
- **User activity logging**
- **Custom email templates** editor
- **SMS notifications** support
- **User onboarding** workflows
