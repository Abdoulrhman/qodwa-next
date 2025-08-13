const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTeacher() {
  try {
    console.log('🧑‍🏫 Creating teacher user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Create the teacher user
    const teacher = await prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.teacher@example.com',
        password: hashedPassword,
        emailVerified: new Date(),
        role: 'TEACHER',
        isTeacher: true,
        subjects: 'Mathematics, Physics',
        teachingExperience: 5,
        qualifications: 'MSc Mathematics, Teaching Certificate',
      },
    });

    console.log('✅ Teacher created successfully!');
    console.log('📧 Email:', teacher.email);
    console.log('🔑 Password: password123');
    console.log('👤 Name:', teacher.name);
    console.log('🎓 Role:', teacher.role);
    console.log('📚 Subjects:', teacher.subjects);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Teacher already exists with this email');
    } else {
      console.error('❌ Error creating teacher:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTeacher();
