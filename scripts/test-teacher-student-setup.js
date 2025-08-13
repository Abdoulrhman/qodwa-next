const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🚀 Starting test data creation...');

    // Create a teacher
    console.log('👨‍🏫 Creating teacher...');
    const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);

    const teacher = await prisma.user.create({
      data: {
        name: 'Ahmed Al-Mahmoud',
        email: 'teacher@qodwa.com',
        password: hashedTeacherPassword,
        phone: '+971501234567',
        gender: 'MALE',
        birthDate: new Date('1985-03-15'),
        isTeacher: true,
        subjects:
          'Quran Memorization, Tajweed, Arabic Language, Islamic Studies',
        teachingExperience: 8,
        qualifications:
          "Bachelor in Islamic Studies from Al-Azhar University, Master in Quranic Sciences, Certified Quran Teacher with Ijazah in 10 Qira'at",
        referralSource: 'Professional Network',
        emailVerified: new Date(), // Verify email immediately for testing
        role: 'USER',
      },
    });

    console.log(`✅ Teacher created: ${teacher.name} (ID: ${teacher.id})`);

    // Create students
    console.log('👥 Creating students...');
    const students = [];

    const studentData = [
      {
        name: 'Sara Abdullah',
        email: 'sara.student@qodwa.com',
        gender: 'FEMALE',
        birthDate: new Date('2008-07-22'),
        referralSource: 'Google',
      },
      {
        name: 'Omar Hassan',
        email: 'omar.student@qodwa.com',
        gender: 'MALE',
        birthDate: new Date('2010-11-10'),
        referralSource: 'Friend',
      },
      {
        name: 'Fatima Al-Zahra',
        email: 'fatima.student@qodwa.com',
        gender: 'FEMALE',
        birthDate: new Date('2009-02-18'),
        referralSource: 'Facebook',
      },
      {
        name: 'Yusuf Ahmed',
        email: 'yusuf.student@qodwa.com',
        gender: 'MALE',
        birthDate: new Date('2011-09-05'),
        referralSource: 'LinkedIn',
      },
    ];

    const hashedStudentPassword = await bcrypt.hash('student123', 10);

    for (const studentInfo of studentData) {
      const student = await prisma.user.create({
        data: {
          ...studentInfo,
          password: hashedStudentPassword,
          phone: `+97150${Math.floor(Math.random() * 9000000) + 1000000}`,
          isTeacher: false,
          emailVerified: new Date(), // Verify email immediately for testing
          role: 'USER',
          assignedTeacherId: teacher.id, // Assign to our teacher
        },
      });
      students.push(student);
      console.log(`✅ Student created: ${student.name} (ID: ${student.id})`);
    }

    // Create TeacherStudent relationships for many-to-many tracking
    console.log('🔗 Creating teacher-student relationships...');
    for (const student of students) {
      await prisma.teacherStudent.create({
        data: {
          teacherId: teacher.id,
          studentId: student.id,
          notes: `Assigned to learn Quran memorization - Level: ${Math.random() > 0.5 ? 'Beginner' : 'Intermediate'}`,
        },
      });
      console.log(
        `✅ Teacher-Student relationship created: ${teacher.name} ↔ ${student.name}`
      );
    }

    // Create some packages for testing
    console.log('📦 Creating test packages...');
    const packages = await Promise.all([
      prisma.package.create({
        data: {
          current_price: '99',
          original_price: '120',
          discount: '17',
          subscription_frequency: 'monthly',
          days: 3,
          classes_per_month: 12,
          class_duration: 30,
          is_popular: true,
          currency: 'USD',
          enrollment_action: 'enroll',
          package_type: 'beginner',
          title: 'Beginner Quran Package',
          description: 'Perfect for starting your Quran learning journey',
          subject: 'Quran Memorization',
          level: 'Beginner',
          features: [
            '3 days per week',
            '30 min sessions',
            'Tajweed basics',
            'Progress tracking',
          ],
        },
      }),
      prisma.package.create({
        data: {
          current_price: '149',
          original_price: '180',
          discount: '17',
          subscription_frequency: 'monthly',
          days: 5,
          classes_per_month: 20,
          class_duration: 45,
          is_popular: true,
          currency: 'USD',
          enrollment_action: 'enroll',
          package_type: 'intermediate',
          title: 'Intermediate Quran Package',
          description: 'Advance your Quran recitation and memorization',
          subject: 'Quran Memorization',
          level: 'Intermediate',
          features: [
            '5 days per week',
            '45 min sessions',
            'Advanced Tajweed',
            'Personalized curriculum',
          ],
        },
      }),
    ]);

    console.log(`✅ Created ${packages.length} test packages`);

    // Create subscriptions for some students
    console.log('💳 Creating test subscriptions...');
    for (let i = 0; i < 2; i++) {
      const student = students[i];
      const selectedPackage = packages[i % packages.length];

      await prisma.subscription.create({
        data: {
          userId: student.id,
          packageId: selectedPackage.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          status: 'ACTIVE',
          classes_completed: Math.floor(Math.random() * 5),
          classes_remaining:
            selectedPackage.classes_per_month - Math.floor(Math.random() * 5),
          next_class_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          auto_renew: true,
          payment_method: 'stripe',
        },
      });
      console.log(`✅ Subscription created for ${student.name}`);
    }

    console.log('\n🎉 Test data creation completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`👨‍🏫 Teacher: ${teacher.name} (${teacher.email})`);
    console.log(`👥 Students: ${students.length} students assigned`);
    console.log(`📦 Packages: ${packages.length} test packages created`);
    console.log(`💳 Subscriptions: 2 active subscriptions created`);

    console.log('\n🔐 Login Credentials:');
    console.log('Teacher:');
    console.log('  Email: teacher@qodwa.com');
    console.log('  Password: teacher123');
    console.log('\nStudents:');
    students.forEach((student) => {
      console.log(`  ${student.name}: ${student.email} / student123`);
    });

    console.log('\n🌐 Test URLs:');
    console.log(
      '- Teacher Dashboard: http://localhost:3000/en/dashboard/teacher/main'
    );
    console.log(
      '- Teacher Students: http://localhost:3000/en/dashboard/teacher/students'
    );
    console.log('- Login: http://localhost:3000/en/auth/login');
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createTestData();
}

module.exports = { createTestData };
