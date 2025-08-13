const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateTeacherRole() {
  try {
    console.log('🔄 Updating teacher role to TEACHER...');

    const updatedTeacher = await prisma.user.update({
      where: { email: 'teacher@qodwa.com' },
      data: { role: 'TEACHER' },
      select: {
        id: true,
        name: true,
        email: true,
        isTeacher: true,
        role: true,
      },
    });

    console.log('✅ Teacher role updated:');
    console.log(JSON.stringify(updatedTeacher, null, 2));
  } catch (error) {
    console.error('❌ Update error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTeacherRole();
