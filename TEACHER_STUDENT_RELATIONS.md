# Teacher-Student Relationship Implementation Guide

## Overview

This guide explains the implementation of teacher-student relationships in the Qodwa platform using Prisma's self-relations while maintaining a single User model (single-table inheritance pattern).

## Database Design

### Relationship Types Implemented

1. **One-to-Many Relationship (Primary Teacher Assignment)**

   - Each student can have one assigned primary teacher
   - Each teacher can have multiple assigned students
   - Uses direct foreign key relationship

2. **Many-to-Many Relationship (Multiple Teacher Access)**
   - Students can work with multiple teachers
   - Teachers can work with multiple students
   - Uses intermediate table for flexibility

### Schema Structure

```prisma
model User {
  // ... existing fields ...

  // One-to-Many: Primary teacher assignment
  assignedTeacherId     String?               // Foreign key for assigned teacher
  assignedTeacher       User?                 @relation("TeacherStudents", fields: [assignedTeacherId], references: [id])
  assignedStudents      User[]                @relation("TeacherStudents")

  // Many-to-Many: Multiple teacher-student connections
  teacherConnections    TeacherStudent[]      @relation("StudentConnections")
  studentConnections    TeacherStudent[]      @relation("TeacherConnections")
}

model TeacherStudent {
  id            String   @id @default(cuid())
  teacherId     String
  studentId     String
  assignedAt    DateTime @default(now())
  isActive      Boolean  @default(true)
  notes         String?  // Optional notes about the relationship

  teacher       User     @relation("TeacherConnections", fields: [teacherId], references: [id], onDelete: Cascade)
  student       User     @relation("StudentConnections", fields: [studentId], references: [id], onDelete: Cascade)

  @@unique([teacherId, studentId])
  @@map("teacher_students")
}
```

## Usage Examples

### 1. Assigning a Primary Teacher to a Student

```typescript
// Assign a primary teacher to a student
await prisma.user.update({
  where: { id: studentId },
  data: {
    assignedTeacherId: teacherId,
  },
});
```

### 2. Creating Multiple Teacher-Student Connections

```typescript
// Create a teacher-student connection
await prisma.teacherStudent.create({
  data: {
    teacherId: teacherId,
    studentId: studentId,
    notes: 'Specialized in Mathematics',
  },
});
```

### 3. Finding All Students for a Teacher

```typescript
// Get all students assigned to a teacher (primary assignments)
const teacherWithStudents = await prisma.user.findUnique({
  where: { id: teacherId },
  include: {
    assignedStudents: true,
  },
});

// Get all students connected to a teacher (including secondary connections)
const allTeacherConnections = await prisma.user.findUnique({
  where: { id: teacherId },
  include: {
    studentConnections: {
      include: {
        student: true,
      },
      where: {
        isActive: true,
      },
    },
  },
});
```

### 4. Finding All Teachers for a Student

```typescript
// Get primary teacher for a student
const studentWithTeacher = await prisma.user.findUnique({
  where: { id: studentId },
  include: {
    assignedTeacher: true,
  },
});

// Get all teachers connected to a student
const allStudentTeachers = await prisma.user.findUnique({
  where: { id: studentId },
  include: {
    teacherConnections: {
      include: {
        teacher: true,
      },
      where: {
        isActive: true,
      },
    },
  },
});
```

### 5. Advanced Queries

```typescript
// Get teachers with their student count
const teachersWithStudentCount = await prisma.user.findMany({
  where: {
    isTeacher: true,
  },
  include: {
    _count: {
      select: {
        assignedStudents: true,
        studentConnections: {
          where: {
            isActive: true,
          },
        },
      },
    },
  },
});

// Get students with multiple teachers
const studentsWithMultipleTeachers = await prisma.user.findMany({
  where: {
    isTeacher: false,
    teacherConnections: {
      some: {
        isActive: true,
      },
    },
  },
  include: {
    assignedTeacher: true,
    teacherConnections: {
      include: {
        teacher: true,
      },
      where: {
        isActive: true,
      },
    },
  },
});
```

## API Implementation Examples

### 1. Assign Teacher to Student Endpoint

```typescript
// app/api/admin/assign-teacher/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { teacherId, studentId, isPrimary } = await request.json();

    if (isPrimary) {
      // Assign as primary teacher
      const updatedStudent = await prisma.user.update({
        where: { id: studentId },
        data: { assignedTeacherId: teacherId },
      });

      return NextResponse.json({
        success: true,
        message: 'Primary teacher assigned successfully',
        student: updatedStudent,
      });
    } else {
      // Create additional teacher connection
      const connection = await prisma.teacherStudent.create({
        data: {
          teacherId,
          studentId,
          notes: 'Additional teacher connection',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Teacher connection created successfully',
        connection,
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to assign teacher',
      },
      { status: 500 }
    );
  }
}
```

### 2. Get Teacher Dashboard Data

```typescript
// app/api/teacher/dashboard/route.ts
export async function GET(request: NextRequest) {
  try {
    const teacherId = getUserIdFromSession(); // Your auth logic here

    const teacherData = await prisma.user.findUnique({
      where: { id: teacherId },
      include: {
        // Primary students
        assignedStudents: {
          include: {
            subscriptions: {
              where: {
                status: 'ACTIVE',
              },
              include: {
                package: true,
              },
            },
          },
        },
        // Additional student connections
        studentConnections: {
          where: {
            isActive: true,
          },
          include: {
            student: {
              include: {
                subscriptions: {
                  where: {
                    status: 'ACTIVE',
                  },
                  include: {
                    package: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      teacher: teacherData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch teacher data',
      },
      { status: 500 }
    );
  }
}
```

### 3. Student Dashboard with Teachers

```typescript
// app/api/student/dashboard/route.ts
export async function GET(request: NextRequest) {
  try {
    const studentId = getUserIdFromSession(); // Your auth logic here

    const studentData = await prisma.user.findUnique({
      where: { id: studentId },
      include: {
        // Primary teacher
        assignedTeacher: true,
        // All teacher connections
        teacherConnections: {
          where: {
            isActive: true,
          },
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
                subjects: true,
                qualifications: true,
                teachingExperience: true,
              },
            },
          },
        },
        // Active subscriptions
        subscriptions: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            package: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      student: studentData,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch student data',
      },
      { status: 500 }
    );
  }
}
```

## Migration Guide

### 1. Create Migration

After updating your schema, run:

```bash
npx prisma migrate dev --name add-teacher-student-relations
```

### 2. Seed Data (Optional)

```typescript
// prisma/seed/teacher-student-relations.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTeacherStudentRelations() {
  // Create sample teacher-student relationships
  const teachers = await prisma.user.findMany({
    where: { isTeacher: true },
  });

  const students = await prisma.user.findMany({
    where: { isTeacher: false },
  });

  // Assign primary teachers
  for (let i = 0; i < students.length; i++) {
    const teacher = teachers[i % teachers.length];
    await prisma.user.update({
      where: { id: students[i].id },
      data: { assignedTeacherId: teacher.id },
    });
  }

  // Create additional connections
  for (const student of students) {
    const additionalTeachers = teachers
      .filter((t) => t.id !== student.assignedTeacherId)
      .slice(0, 2);

    for (const teacher of additionalTeachers) {
      await prisma.teacherStudent.create({
        data: {
          teacherId: teacher.id,
          studentId: student.id,
          notes: `Additional subject specialist: ${teacher.subjects}`,
        },
      });
    }
  }
}
```

## Frontend Components

### Teacher Selection Component

```tsx
// components/admin/TeacherAssignment.tsx
import { useState } from 'react';

interface TeacherAssignmentProps {
  studentId: string;
  currentTeachers: Teacher[];
  availableTeachers: Teacher[];
}

export const TeacherAssignment: React.FC<TeacherAssignmentProps> = ({
  studentId,
  currentTeachers,
  availableTeachers,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const handleAssignTeacher = async () => {
    try {
      const response = await fetch('/api/admin/assign-teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: selectedTeacherId,
          studentId,
          isPrimary,
        }),
      });

      if (response.ok) {
        // Handle success - refresh data, show notification, etc.
      }
    } catch (error) {
      console.error('Failed to assign teacher:', error);
    }
  };

  return (
    <div className='space-y-4'>
      <h3>Assign Teacher to Student</h3>

      <div>
        <label>Select Teacher:</label>
        <select
          value={selectedTeacherId}
          onChange={(e) => setSelectedTeacherId(e.target.value)}
        >
          <option value=''>Choose a teacher...</option>
          {availableTeachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name} - {teacher.subjects}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>
          <input
            type='checkbox'
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
          />
          Set as Primary Teacher
        </label>
      </div>

      <button onClick={handleAssignTeacher}>Assign Teacher</button>
    </div>
  );
};
```

## Best Practices

### 1. Data Integrity

- Always validate that teachers have `isTeacher: true`
- Ensure students cannot be assigned as teachers
- Use database constraints to prevent invalid relationships

### 2. Performance

- Use appropriate indexes on foreign key fields
- Consider pagination for large teacher/student lists
- Implement caching for frequently accessed relationships

### 3. Business Logic

- Implement rules for maximum students per teacher
- Add validation for subject matching
- Consider availability/scheduling constraints

### 4. Security

- Validate user permissions before creating relationships
- Implement proper role-based access control
- Log all teacher-student assignment changes

## Troubleshooting

### Common Issues

1. **Circular Reference Errors**

   - Ensure proper relation naming
   - Use `@relation` directive correctly

2. **Migration Errors**

   - Check for existing data conflicts
   - Handle foreign key constraints properly

3. **Query Performance**
   - Add appropriate indexes
   - Use `select` to limit returned fields
   - Implement proper pagination

This implementation provides a flexible foundation for managing teacher-student relationships while maintaining the single-table inheritance pattern for users.
