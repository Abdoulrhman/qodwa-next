const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTeacherUser() {
  try {
    const teacher = await prisma.user.findUnique({
      where: { email: 'teacher@qodwa.com' },
      select: {
        id: true,
        name: true,
        email: true,
        isTeacher: true,
        role: true,
        subjects: true,
        teachingExperience: true,
        qualifications: true
      }
    });

    if (teacher) {
      console.log('✅ Teacher found in database:');
      console.log(JSON.stringify(teacher, null, 2));
    } else {
      console.log('❌ Teacher not found in database');
    }
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTeacherUser();
