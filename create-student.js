const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createStudent() {
  try {
    console.log('👨‍🎓 Creating student user...');

    const hashedPassword = await bcrypt.hash('password123', 12);

    const student = await prisma.user.create({
      data: {
        name: 'Ahmed Hassan',
        email: 'ahmed.student@example.com',
        password: hashedPassword,
        emailVerified: new Date(),
        isTeacher: false,
        role: 'USER',
        phone: '+20123456789',
        gender: 'MALE',
        birthDate: new Date('2000-01-15'),
      },
    });

    console.log('✅ Student created successfully!');
    console.log('📧 Email:', student.email);
    console.log('🔑 Password: password123');
    console.log('👤 Name:', student.name);
    console.log('🎓 Role:', student.role);

    return student;
  } catch (error) {
    console.error('❌ Error creating student:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStudent();
