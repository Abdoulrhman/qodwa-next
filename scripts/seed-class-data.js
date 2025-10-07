const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedClassData() {
  try {
    console.log('🌱 Seeding class session data...');

    // Find a teacher and student
    const teacher = await prisma.user.findFirst({
      where: { isTeacher: true },
      include: {
        assignedStudents: {
          include: {
            subscriptions: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!teacher || !teacher.assignedStudents.length) {
      console.log('❌ No teacher with assigned students found');
      return;
    }

    const student = teacher.assignedStudents[0];
    if (!student.subscriptions.length) {
      console.log('❌ Student has no active subscriptions');
      return;
    }

    const subscription = student.subscriptions[0];

    // Create some sample zoom links for students
    console.log('📝 Creating sample zoom links...');

    // Generate a few completed class sessions
    for (let i = 0; i < 3; i++) {
      const startTime = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000); // Past days
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes later

      await prisma.classSession.create({
        data: {
          studentId: student.id,
          teacherId: teacher.id,
          subscriptionId: subscription.id,
          startTime,
          endTime,
          duration: 30,
          zoomLink: `https://zoom.us/j/sample${i}?pwd=test`,
          status: 'COMPLETED',
          teacherEarning: 2.0,
          notes: `Sample class session ${i + 1}`,
        },
      });
    }

    // Update subscription classes completed
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        classes_completed: 3,
      },
    });

    // Create teacher earnings record
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    await prisma.teacherEarnings.upsert({
      where: {
        teacherId_currentMonth_currentYear: {
          teacherId: teacher.id,
          currentMonth,
          currentYear,
        },
      },
      update: {
        totalEarnings: 6.0, // 3 classes * $2
        totalClasses: 3,
      },
      create: {
        teacherId: teacher.id,
        totalEarnings: 6.0,
        totalClasses: 3,
        currentMonth,
        currentYear,
      },
    });

    console.log('✅ Sample class data created successfully!');
    console.log(`📊 Created 3 completed classes for teacher: ${teacher.name}`);
    console.log(`💰 Teacher earnings: $6.00 for this month`);
  } catch (error) {
    console.error('❌ Error seeding class data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedClassData();
