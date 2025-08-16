const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function completeTeacherStudentFlows() {
  try {
    console.log('🔧 Completing Teacher-Student Flows...\n');

    // 1. Complete Sarah Johnson's teacher profile
    console.log("👩‍🏫 Completing Sarah Johnson's profile...");

    const sarahUpdate = await prisma.user.updateMany({
      where: {
        email: 'sarah.teacher@example.com',
        isTeacher: true,
      },
      data: {
        phone: '+966502345678',
        subjects: 'Arabic Language, Islamic History, Quranic Studies',
        qualifications:
          'Bachelor in Arabic Literature, Certified Islamic Studies Teacher',
        teachingExperience: 6,
        referralSource: 'Professional Network',
      },
    });

    if (sarahUpdate.count > 0) {
      console.log("✅ Sarah Johnson's profile completed");
    } else {
      console.log('❌ Sarah Johnson not found or not updated');
    }

    // 2. Find unassigned students
    console.log('\n👥 Finding unassigned students...');

    const unassignedStudents = await prisma.user.findMany({
      where: {
        isTeacher: false,
        assignedTeacherId: null,
      },
    });

    console.log(`Found ${unassignedStudents.length} unassigned students:`);
    unassignedStudents.forEach((student) => {
      console.log(`   - ${student.name} (${student.email})`);
    });

    // 3. Get available teachers
    const teachers = await prisma.user.findMany({
      where: {
        isTeacher: true,
      },
      include: {
        _count: {
          select: {
            assignedStudents: true,
          },
        },
      },
    });

    console.log(`\n👨‍🏫 Available teachers:`);
    teachers.forEach((teacher) => {
      console.log(
        `   - ${teacher.name}: ${teacher._count.assignedStudents} students`
      );
    });

    // 4. Assign teachers to unassigned students (balance the load)
    if (unassignedStudents.length > 0 && teachers.length > 0) {
      console.log('\n🔗 Assigning teachers to students...');

      // Sort teachers by current student count (ascending) for load balancing
      const sortedTeachers = teachers.sort(
        (a, b) => a._count.assignedStudents - b._count.assignedStudents
      );

      for (let i = 0; i < unassignedStudents.length; i++) {
        const student = unassignedStudents[i];
        const teacher = sortedTeachers[i % sortedTeachers.length]; // Round-robin assignment

        // Assign primary teacher
        await prisma.user.update({
          where: { id: student.id },
          data: { assignedTeacherId: teacher.id },
        });

        // Create TeacherStudent relationship
        await prisma.teacherStudent.upsert({
          where: {
            teacherId_studentId: {
              teacherId: teacher.id,
              studentId: student.id,
            },
          },
          update: {
            isActive: true,
            notes: 'Auto-assigned for load balancing',
          },
          create: {
            teacherId: teacher.id,
            studentId: student.id,
            isActive: true,
            notes: 'Auto-assigned for load balancing',
          },
        });

        console.log(`✅ Assigned ${teacher.name} to ${student.name}`);

        // Update teacher count for next iteration
        teacher._count.assignedStudents++;
        sortedTeachers.sort(
          (a, b) => a._count.assignedStudents - b._count.assignedStudents
        );
      }
    }

    // 5. Create some sample subscriptions for students without them
    console.log('\n💳 Creating sample subscriptions...');

    const studentsWithoutSubscriptions = await prisma.user.findMany({
      where: {
        isTeacher: false,
        subscriptions: {
          none: {},
        },
      },
      take: 3, // Limit to 3 students for demo
    });

    // Get available packages
    const packages = await prisma.package.findMany({
      where: {
        is_active: true,
      },
      take: 2,
    });

    if (packages.length > 0 && studentsWithoutSubscriptions.length > 0) {
      for (const student of studentsWithoutSubscriptions) {
        const randomPackage =
          packages[Math.floor(Math.random() * packages.length)];

        const subscription = await prisma.subscription.create({
          data: {
            userId: student.id,
            packageId: randomPackage.id,
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            classes_completed: 0,
            classes_remaining: randomPackage.total_classes || 20,
            auto_renew: false,
          },
        });

        console.log(
          `✅ Created subscription for ${student.name} - Package: ${randomPackage.title || 'Package ' + randomPackage.id}`
        );
      }
    }

    // 6. Verification - Run the validation again
    console.log('\n🔍 Running final validation...');

    const finalTeachers = await prisma.user.findMany({
      where: { isTeacher: true },
      include: {
        _count: {
          select: {
            assignedStudents: true,
            studentConnections: { where: { isActive: true } },
          },
        },
      },
    });

    const finalStudents = await prisma.user.findMany({
      where: { isTeacher: false },
      include: {
        assignedTeacher: true,
        subscriptions: true,
      },
    });

    const teachersWithCompleteProfile = finalTeachers.filter(
      (t) => t.name && t.email && t.phone && t.subjects && t.qualifications
    ).length;

    const studentsWithTeachers = finalStudents.filter(
      (s) => s.assignedTeacher
    ).length;
    const studentsWithSubscriptions = finalStudents.filter(
      (s) => s.subscriptions.length > 0
    ).length;

    console.log('\n📊 FINAL RESULTS:');
    console.log('==================');
    console.log(
      `Teachers with complete profiles: ${teachersWithCompleteProfile}/${finalTeachers.length}`
    );
    console.log(
      `Students with assigned teachers: ${studentsWithTeachers}/${finalStudents.length}`
    );
    console.log(
      `Students with subscriptions: ${studentsWithSubscriptions}/${finalStudents.length}`
    );

    const allFlowsComplete =
      teachersWithCompleteProfile === finalTeachers.length &&
      studentsWithTeachers === finalStudents.length;

    console.log(
      `\n🎯 Overall Status: ${allFlowsComplete ? '✅ ALL FLOWS COMPLETED' : '⚠️ PARTIAL COMPLETION'}`
    );

    if (allFlowsComplete) {
      console.log(
        '\n🎉 SUCCESS! Both teacher and student flows are now complete:'
      );
      console.log('✅ All teachers have complete profiles');
      console.log('✅ All students are assigned to teachers');
      console.log('✅ Teacher-student relationships are properly established');
      console.log('✅ Sample subscriptions created');
    }

    return allFlowsComplete;
  } catch (error) {
    console.error('❌ Error completing flows:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the completion script
completeTeacherStudentFlows()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
