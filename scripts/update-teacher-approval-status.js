const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateExistingTeachers() {
  try {
    console.log('🔄 Updating existing teachers with approval status...\n');

    // Find all existing teachers
    const existingTeachers = await prisma.user.findMany({
      where: {
        isTeacher: true,
      },
    });

    console.log(`Found ${existingTeachers.length} existing teachers:`);

    for (const teacher of existingTeachers) {
      console.log(`- ${teacher.name} (${teacher.email})`);

      // Update each teacher to approved status (since they were already working)
      await prisma.user.update({
        where: { id: teacher.id },
        data: {
          teacherApprovalStatus: 'APPROVED',
          teacherApprovedAt: new Date(),
          role: 'TEACHER', // Ensure role is set to TEACHER
        },
      });
    }

    console.log('\n✅ All existing teachers have been marked as approved');

    // Test the new admin endpoints
    console.log('\n🧪 Testing admin teacher management...');

    const allTeachers = await prisma.user.findMany({
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

    console.log('\nTeacher Status Summary:');
    allTeachers.forEach((teacher) => {
      console.log(
        `- ${teacher.name}: ${teacher.teacherApprovalStatus || 'PENDING'} (${teacher._count.assignedStudents} students)`
      );
    });

    console.log('\n🎉 Teacher approval system is ready!');
    console.log('\nNext steps:');
    console.log(
      '1. Visit /dashboard/admin/teachers to manage teacher applications'
    );
    console.log(
      '2. Visit /dashboard/admin/assign-teacher to assign teachers to students'
    );
    console.log('3. New teacher registrations will require admin approval');
  } catch (error) {
    console.error('❌ Error updating teachers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingTeachers();
