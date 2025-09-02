const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTeacherStudent() {
  try {
    console.log('🔗 Setting up teacher-student relationship...');

    // Find the teacher and student
    const teacher = await prisma.user.findFirst({
      where: {
        email: 'sarah.teacher@example.com',
        isTeacher: true,
      },
    });

    const student = await prisma.user.findFirst({
      where: {
        email: 'ahmed.student@example.com',
        isTeacher: false,
      },
    });

    if (!teacher || !student) {
      console.log('❌ Teacher or student not found');
      return;
    }

    // Assign teacher to student
    await prisma.user.update({
      where: { id: student.id },
      data: { assignedTeacherId: teacher.id },
    });

    // Create TeacherStudent relationship
    await prisma.teacherStudent.create({
      data: {
        teacherId: teacher.id,
        studentId: student.id,
        isActive: true,
        notes: 'Test assignment',
      },
    });

    // Find a package
    const packageData = await prisma.package.findFirst();

    if (!packageData) {
      console.log('❌ No packages found');
      return;
    }

    // Create a subscription for the student
    const subscription = await prisma.subscription.create({
      data: {
        userId: student.id,
        packageId: packageData.id,
        status: 'ACTIVE',
        classes_completed: 0,
        classes_remaining: packageData.total_classes || 8,
      },
    });

    console.log('✅ Teacher-student relationship created!');
    console.log(`👨‍🏫 Teacher: ${teacher.name}`);
    console.log(`👨‍🎓 Student: ${student.name}`);
    console.log(`📦 Subscription: ${packageData.title || 'Package'}`);
  } catch (error) {
    console.error('❌ Error setting up relationship:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTeacherStudent();
