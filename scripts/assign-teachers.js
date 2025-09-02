const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignTeachersToSara() {
  try {
    console.log('🔍 Finding Sara and available teachers...');

    // Find Sara
    const sara = await prisma.user.findUnique({
      where: { email: 'sara.student@qodwa.com' },
    });

    if (!sara) {
      console.log('❌ Sara not found!');
      return;
    }

    console.log('✅ Found Sara:', sara.name, sara.email);

    // Find teachers (let's mark some users as teachers first)
    console.log('🔧 Updating users to be teachers...');

    // Mark Ahmed as a teacher
    const ahmed = await prisma.user.update({
      where: { email: 'teacher@qodwa.com' },
      data: {
        isTeacher: true,
        subjects: 'القرآن الكريم، التجويد، الفقه',
        qualifications: 'ماجستير في علوم القرآن - جامعة الأزهر',
        teachingExperience: 8,
        phone: '+966501234567',
      },
    });

    // Mark Sarah Johnson as a teacher
    const sarah = await prisma.user.update({
      where: { email: 'sarah.teacher@example.com' },
      data: {
        isTeacher: true,
        subjects: 'English, Quran Translation',
        qualifications: 'Bachelor in Islamic Studies, TESOL Certificate',
        teachingExperience: 5,
        phone: '+1234567890',
      },
    });

    console.log('✅ Updated teachers:', ahmed.name, sarah.name);

    // Assign Ahmed as Sara's primary teacher
    console.log('🎯 Assigning primary teacher...');
    await prisma.user.update({
      where: { id: sara.id },
      data: { assignedTeacherId: ahmed.id },
    });

    // Create additional teacher connection with Sarah
    console.log('🔗 Creating additional teacher connection...');
    await prisma.teacherStudent.create({
      data: {
        teacherId: sarah.id,
        studentId: sara.id,
        notes: 'English and translation specialist',
        isActive: true,
      },
    });

    console.log('🎉 Successfully assigned teachers to Sara!');
    console.log('📋 Summary:');
    console.log(`   Primary Teacher: ${ahmed.name} (${ahmed.email})`);
    console.log(`   Additional Teacher: ${sarah.name} (${sarah.email})`);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignTeachersToSara();
