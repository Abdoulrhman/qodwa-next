import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Get students with their assigned teachers
    const whereClause: any = {
      role: 'USER',
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    if (status === 'assigned') {
      whereClause.assignedTeacherId = { not: null };
    } else if (status === 'unassigned') {
      whereClause.assignedTeacherId = null;
    }

    const [students, total] = await Promise.all([
      db.user.findMany({
        where: whereClause,
        include: {
          assignedTeacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      db.user.count({ where: whereClause }),
    ]);

    // Get all approved teachers for assignment options
    const teachers = await db.user.findMany({
      where: {
        role: 'TEACHER',
        teacherApprovalStatus: 'APPROVED',
      },
      select: {
        id: true,
        name: true,
        email: true,
        subjects: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      students,
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Handle both single student and bulk assignment
    const isBulkAssignment = 'studentIds' in body;

    if (isBulkAssignment) {
      const { studentIds, teacherId } = body;

      if (
        !studentIds ||
        !Array.isArray(studentIds) ||
        studentIds.length === 0
      ) {
        return NextResponse.json(
          { error: 'Student IDs array is required and cannot be empty' },
          { status: 400 }
        );
      }

      if (!teacherId) {
        return NextResponse.json(
          { error: 'Teacher ID is required for bulk assignment' },
          { status: 400 }
        );
      }

      // Verify teacher exists and is approved
      const teacher = await db.user.findFirst({
        where: {
          id: teacherId,
          role: 'TEACHER',
          teacherApprovalStatus: 'APPROVED',
        },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: 'Teacher not found or not approved' },
          { status: 404 }
        );
      }

      // Verify all students exist and are students
      const students = await db.user.findMany({
        where: {
          id: { in: studentIds },
          role: 'USER',
        },
      });

      if (students.length !== studentIds.length) {
        return NextResponse.json(
          { error: 'One or more students not found' },
          { status: 404 }
        );
      }

      // Update all students with the new teacher assignment
      const updatedStudents = await db.user.updateMany({
        where: {
          id: { in: studentIds },
        },
        data: {
          assignedTeacherId: teacherId,
        },
      });

      // Also create TeacherStudent relationships
      const teacherStudentData = studentIds.map((studentId) => ({
        teacherId,
        studentId,
        isActive: true,
      }));

      // Use upsert to handle existing relationships
      await Promise.all(
        teacherStudentData.map((data) =>
          db.teacherStudent.upsert({
            where: {
              teacherId_studentId: {
                teacherId: data.teacherId,
                studentId: data.studentId,
              },
            },
            update: {
              isActive: true,
            },
            create: data,
          })
        )
      );

      return NextResponse.json({
        message: `Successfully assigned ${studentIds.length} student(s) to ${teacher.name}`,
        assignedCount: updatedStudents.count,
        teacher: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
        },
      });
    } else {
      // Handle single student assignment (existing logic)
      const { studentId, teacherId } = body;

      if (!studentId) {
        return NextResponse.json(
          { error: 'Student ID is required' },
          { status: 400 }
        );
      }

      // Verify student exists and is a student
      const student = await db.user.findFirst({
        where: {
          id: studentId,
          role: 'USER',
        },
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }

      // If teacherId is provided, verify teacher exists and is approved
      if (teacherId) {
        const teacher = await db.user.findFirst({
          where: {
            id: teacherId,
            role: 'TEACHER',
            teacherApprovalStatus: 'APPROVED',
          },
        });

        if (!teacher) {
          return NextResponse.json(
            { error: 'Teacher not found or not approved' },
            { status: 404 }
          );
        }
      }

      // Update student assignment
      const updatedStudent = await db.user.update({
        where: { id: studentId },
        data: {
          assignedTeacherId: teacherId || null,
        },
        include: {
          assignedTeacher: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const action = teacherId ? 'assigned' : 'unassigned';
      const teacherName = teacherId
        ? updatedStudent.assignedTeacher?.name
        : null;

      return NextResponse.json({
        message: `Student ${action} successfully${teacherName ? ` to ${teacherName}` : ''}`,
        student: updatedStudent,
      });
    }
  } catch (error) {
    console.error('Error updating student assignment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Remove teacher assignment from student
    const updatedStudent = await db.user.update({
      where: { id: studentId },
      data: {
        assignedTeacherId: null,
      },
    });

    return NextResponse.json({
      message: 'Student unassigned successfully',
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Error removing student assignment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
