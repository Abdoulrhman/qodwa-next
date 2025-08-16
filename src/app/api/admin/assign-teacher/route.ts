import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { User } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { teacherId, studentId, isPrimary, notes } = await request.json();

    // Validate required fields
    if (!teacherId || !studentId) {
      return NextResponse.json(
        { error: 'Teacher ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Verify teacher exists and is actually a teacher
    const teacher = await db.user.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || !teacher.isTeacher) {
      return NextResponse.json(
        { error: 'Invalid teacher ID or user is not a teacher' },
        { status: 400 }
      );
    }

    // Verify student exists and is not a teacher
    const student = await db.user.findUnique({
      where: { id: studentId },
    });

    if (!student || student.isTeacher) {
      return NextResponse.json(
        { error: 'Invalid student ID or user is not a student' },
        { status: 400 }
      );
    }

    if (isPrimary) {
      // Assign as primary teacher
      const updatedStudent = await db.user.update({
        where: { id: studentId },
        data: { assignedTeacherId: teacherId },
      });

      // Also create/update the TeacherStudent relationship
      await db.teacherStudent.upsert({
        where: {
          teacherId_studentId: {
            teacherId,
            studentId,
          },
        },
        update: {
          isActive: true,
          notes: notes || 'Primary teacher assignment',
        },
        create: {
          teacherId,
          studentId,
          isActive: true,
          notes: notes || 'Primary teacher assignment',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully assigned ${teacher.name} as primary teacher to ${student.name}`,
        data: {
          teacher: {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
          },
          student: {
            id: student.id,
            name: student.name,
            email: student.email,
          },
          isPrimary: true,
        },
      });
    } else {
      // Create additional teacher-student connection
      const existingConnection = await db.teacherStudent.findUnique({
        where: {
          teacherId_studentId: {
            teacherId,
            studentId,
          },
        },
      });

      if (existingConnection) {
        return NextResponse.json(
          { error: 'Teacher-student relationship already exists' },
          { status: 400 }
        );
      }

      const newConnection = await db.teacherStudent.create({
        data: {
          teacherId,
          studentId,
          isActive: true,
          notes: notes || 'Additional teacher connection',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully created additional teacher connection between ${teacher.name} and ${student.name}`,
        data: {
          teacher: {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
          },
          student: {
            id: student.id,
            name: student.name,
            email: student.email,
          },
          isPrimary: false,
          relationshipId: newConnection.id,
        },
      });
    }
  } catch (error) {
    console.error('Error assigning teacher to student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Get all teachers with their student counts
    const teachers = await db.user.findMany({
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
      orderBy: {
        name: 'asc',
      },
    });

    // Get all students with their teacher assignments
    const students = await db.user.findMany({
      where: {
        isTeacher: false,
      },
      include: {
        assignedTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        teacherConnections: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          where: {
            isActive: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get unassigned students
    const unassignedStudents = students.filter(
      (student: any) => !student.assignedTeacher
    );

    return NextResponse.json({
      success: true,
      data: {
        teachers: teachers.map((teacher: any) => ({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone,
          subjects: teacher.subjects,
          qualifications: teacher.qualifications,
          teachingExperience: teacher.teachingExperience,
          primaryStudentCount: teacher._count.assignedStudents,
          totalConnectionCount: teacher._count.studentConnections,
        })),
        students: students.map((student: any) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          assignedTeacher: student.assignedTeacher,
          additionalTeachers: student.teacherConnections.map((conn: any) => ({
            id: conn.teacher.id,
            name: conn.teacher.name,
            email: conn.teacher.email,
            notes: conn.notes,
            assignedAt: conn.assignedAt,
          })),
        })),
        unassignedStudents: unassignedStudents.map((student: any) => ({
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone,
        })),
        stats: {
          totalTeachers: teachers.length,
          totalStudents: students.length,
          unassignedStudents: unassignedStudents.length,
          assignedStudents: students.length - unassignedStudents.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching assignment data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const removePrimary = searchParams.get('removePrimary') === 'true';

    if (!teacherId || !studentId) {
      return NextResponse.json(
        { error: 'Teacher ID and Student ID are required' },
        { status: 400 }
      );
    }

    if (removePrimary) {
      // Remove primary teacher assignment
      await db.user.update({
        where: { id: studentId },
        data: { assignedTeacherId: null },
      });
    }

    // Remove or deactivate the TeacherStudent relationship
    await db.teacherStudent.updateMany({
      where: {
        teacherId,
        studentId,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher-student relationship removed successfully',
    });
  } catch (error) {
    console.error('Error removing teacher-student relationship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
