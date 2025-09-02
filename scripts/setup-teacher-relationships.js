const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTeacherRelationships() {
  try {
    console.log('Setting up teacher-student relationships...');

    // First, set Ahmed Al-Mahmoud and Sarah Johnson as teachers
    await prisma.user.updateMany({
      where: {
        email: {
          in: ['teacher@qodwa.com', 'sarah.teacher@example.com'],
        },
      },
      data: {
        isTeacher: true,
        subjects: 'Quran, Arabic, Islamic Studies',
        qualifications: 'Masters in Islamic Studies',
        teachingExperience: 5,
        phone: '+966501234567',
      },
    });

    console.log('✅ Updated teachers');

    // Find the teacher users
    const teachers = await prisma.user.findMany({
      where: {
        isTeacher: true,
      },
    });

    console.log(
      'Found teachers:',
      teachers.map((t) => ({ name: t.name, email: t.email }))
    );

    // Find Sara student
    const sara = await prisma.user.findUnique({
      where: {
        email: 'sara.student@qodwa.com',
      },
    });

    if (!sara) {
      console.log('❌ Sara student not found');
      return;
    }

    console.log('Found Sara:', { name: sara.name, email: sara.email });

    if (teachers.length === 0) {
      console.log('❌ No teachers found');
      return;
    }

    // Assign primary teacher (Ahmed Al-Mahmoud)
    const primaryTeacher = teachers[0];
    await prisma.user.update({
      where: {
        id: sara.id,
      },
      data: {
        assignedTeacherId: primaryTeacher.id,
      },
    });

    console.log(
      `✅ Assigned ${primaryTeacher.name} as primary teacher to Sara`
    );

    // Create additional teacher connection if there's a second teacher
    if (teachers.length > 1) {
      const additionalTeacher = teachers[1];

      // Check if connection already exists
      const existingConnection = await prisma.teacherStudent.findUnique({
        where: {
          teacherId_studentId: {
            teacherId: additionalTeacher.id,
            studentId: sara.id,
          },
        },
      });

      if (!existingConnection) {
        await prisma.teacherStudent.create({
          data: {
            teacherId: additionalTeacher.id,
            studentId: sara.id,
            notes: 'Additional subject specialist',
            isActive: true,
          },
        });

        console.log(
          `✅ Created additional teacher connection with ${additionalTeacher.name}`
        );
      } else {
        console.log(
          `ℹ️ Connection with ${additionalTeacher.name} already exists`
        );
      }
    }

    // Verify the setup
    const updatedSara = await prisma.user.findUnique({
      where: {
        id: sara.id,
      },
      include: {
        assignedTeacher: true,
        teacherConnections: {
          include: {
            teacher: true,
          },
        },
      },
    });

    console.log('\n📊 Final setup:');
    console.log(
      'Primary teacher:',
      updatedSara.assignedTeacher?.name || 'None'
    );
    console.log(
      'Additional teachers:',
      updatedSara.teacherConnections.map((c) => c.teacher.name)
    );

    console.log('\n✅ Setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up relationships:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTeacherRelationships();
