# Email System Documentation

## Overview

The Qodwa platform now includes a comprehensive email system using Resend that allows you to send various types of emails to students and teachers. This system includes both individual emails and bulk email functionality.

## Setup

### Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```bash
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=your-domain@yourdomain.com  # Optional, defaults to onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Your app URL
```

### Email Functions Available

The system includes the following email functions in `lib/mail.ts`:

#### Student Emails

- `sendWelcomeEmailToStudent` - Welcome new students
- `sendTeacherAssignmentEmailToStudent` - Notify students of teacher assignments
- `sendClassReminderToStudent` - Send class reminders
- `sendProgressUpdateToStudent` - Send progress updates
- `sendBulkEmailToStudents` - Send bulk emails to multiple students

#### Teacher Emails

- `sendWelcomeEmailToTeacher` - Welcome new teachers
- `sendStudentAssignmentEmailToTeacher` - Notify teachers of student assignments
- `sendTeacherApprovalEmail` - Send approval/rejection emails
- `sendBulkEmailToTeachers` - Send bulk emails to multiple teachers

## API Endpoints

### Student Emails: `/api/emails/students`

Send emails to students with various types:

#### Welcome Email

```javascript
POST /api/emails/students
{
  "type": "welcome",
  "data": {
    "studentId": "student_id_here",
    "teacherName": "Teacher Name" // Optional
  }
}
```

#### Teacher Assignment Email

```javascript
POST /api/emails/students
{
  "type": "teacher_assignment",
  "data": {
    "studentId": "student_id_here",
    "teacherId": "teacher_id_here"
  }
}
```

#### Class Reminder Email

```javascript
POST /api/emails/students
{
  "type": "class_reminder",
  "data": {
    "studentId": "student_id_here",
    "classDate": "2025-08-20",
    "classTime": "2:00 PM - 3:00 PM",
    "subjects": "Quran Memorization" // Optional
  }
}
```

#### Progress Update Email

```javascript
POST /api/emails/students
{
  "type": "progress_update",
  "data": {
    "studentId": "student_id_here",
    "progressNote": "Great progress this week!",
    "completedLessons": 5, // Optional
    "totalLessons": 10 // Optional
  }
}
```

#### Bulk Email to Students

```javascript
POST /api/emails/students
{
  "type": "bulk_email",
  "data": {
    "subject": "Important Announcement",
    "message": "Your message here...",
    "studentIds": ["id1", "id2"], // Optional - leave empty for all students
    "includePersonalization": true // Optional - defaults to true
  }
}
```

### Teacher Emails: `/api/emails/teachers`

Send emails to teachers with various types:

#### Welcome Email

```javascript
POST /api/emails/teachers
{
  "type": "welcome",
  "data": {
    "teacherId": "teacher_id_here",
    "approvalStatus": "APPROVED" // or "PENDING"
  }
}
```

#### Student Assignment Email

```javascript
POST /api/emails/teachers
{
  "type": "student_assignment",
  "data": {
    "teacherId": "teacher_id_here",
    "studentId": "student_id_here",
    "packageDetails": "30 minutes, 3 days per week" // Optional
  }
}
```

#### Approval Status Email

```javascript
POST /api/emails/teachers
{
  "type": "approval_status",
  "data": {
    "teacherId": "teacher_id_here",
    "status": "APPROVED", // or "REJECTED"
    "rejectionReason": "Reason for rejection" // Required if status is REJECTED
  }
}
```

#### Bulk Email to Teachers

```javascript
POST /api/emails/teachers
{
  "type": "bulk_email",
  "data": {
    "subject": "Important Update",
    "message": "Your message here...",
    "teacherIds": ["id1", "id2"], // Optional - leave empty for all teachers
    "includePersonalization": true // Optional - defaults to true
  }
}
```

## Email Manager Component

A React component is available at `src/shared/components/email-manager.tsx` that provides a user-friendly interface for sending emails. This component can be used in admin dashboards.

### Usage

```jsx
import EmailManager from '@/shared/components/email-manager';

function AdminDashboard() {
  return (
    <div>
      <EmailManager className='max-w-2xl mx-auto' />
    </div>
  );
}
```

## Security

- Only administrators can send emails to teachers
- Only administrators and teachers can send emails to students
- Teachers can only send progress updates to their assigned students
- All endpoints require authentication

## Testing

### Test Endpoint: `/api/test-email-advanced`

Use this endpoint to test email functionality:

```javascript
// Test student welcome email
POST /api/test-email-advanced
{
  "type": "test_student_welcome",
  "data": {
    "email": "test@example.com",
    "name": "Test Student",
    "teacherName": "Test Teacher"
  }
}

// Test teacher welcome email
POST /api/test-email-advanced
{
  "type": "test_teacher_welcome",
  "data": {
    "email": "teacher@example.com",
    "name": "Test Teacher",
    "approvalStatus": "APPROVED"
  }
}

// Test bulk email to students
POST /api/test-email-advanced
{
  "type": "test_bulk_students",
  "data": {
    "email": "test@example.com",
    "name": "Test Student",
    "subject": "Test Subject",
    "message": "This is a test message."
  }
}

// Test bulk email to teachers
POST /api/test-email-advanced
{
  "type": "test_bulk_teachers",
  "data": {
    "email": "teacher@example.com",
    "name": "Test Teacher",
    "subject": "Test Subject",
    "message": "This is a test message."
  }
}
```

## Email Templates

All emails are sent as HTML with responsive styling. The templates include:

- Professional styling with your brand colors
- Personalization with recipient names
- Clear call-to-actions where appropriate
- Responsive design for mobile devices

## Error Handling

The system includes comprehensive error handling:

- Database validation (checking if users exist)
- Permission validation (role-based access)
- Email delivery error handling
- Bulk email result tracking (success/failure counts)

## Best Practices

1. **Test First**: Always test emails using the test endpoint before sending to real users
2. **Personalization**: Use personalization for better engagement
3. **Clear Subjects**: Use descriptive and clear email subjects
4. **Bulk Emails**: Be cautious with bulk emails - consider sending to small groups first
5. **Monitoring**: Monitor email delivery results and handle failures appropriately

## Integration Examples

### Automatic Welcome Emails

```javascript
// In your user registration logic
async function registerStudent(userData) {
  const student = await db.user.create({ data: userData });

  // Send welcome email
  await fetch('/api/emails/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'welcome',
      data: { studentId: student.id },
    }),
  });
}
```

### Teacher Assignment Notifications

```javascript
// When assigning a teacher to a student
async function assignTeacher(studentId, teacherId) {
  await db.user.update({
    where: { id: studentId },
    data: { assignedTeacherId: teacherId },
  });

  // Notify student
  await fetch('/api/emails/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'teacher_assignment',
      data: { studentId, teacherId },
    }),
  });

  // Notify teacher
  await fetch('/api/emails/teachers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'student_assignment',
      data: { teacherId, studentId },
    }),
  });
}
```

## Troubleshooting

### Common Issues

1. **Email not sending**: Check your Resend API key and domain setup
2. **User not found errors**: Verify user IDs are correct
3. **Permission denied**: Ensure the user has the correct role
4. **Bulk email partial failures**: Check individual email addresses for validity

### Checking Email Status

You can check the results of bulk emails from the API response:

```javascript
{
  "success": true,
  "message": "Bulk email sent to 45 students. 2 failed.",
  "results": {
    "total": 47,
    "successful": 45,
    "failed": 2
  }
}
```

This comprehensive email system provides all the functionality needed to communicate effectively with students and teachers in your Qodwa platform.
