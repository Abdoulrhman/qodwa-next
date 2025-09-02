const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateAPIEndpoints() {
  try {
    console.log('🔍 Validating API Endpoints and Flow Integration...\n');

    // Check if required API routes exist
    const fs = require('fs');
    const path = require('path');

    const apiRoutes = [
      'src/app/api/teacher/students/route.ts',
      'src/app/api/teacher/stats/route.ts',
      'src/app/api/admin/assign-teacher/route.ts',
    ];

    console.log('📁 Checking API Route Files:');
    console.log('============================');

    for (const route of apiRoutes) {
      const routePath = path.join(process.cwd(), route);
      if (fs.existsSync(routePath)) {
        console.log(`✅ ${route} - EXISTS`);
      } else {
        console.log(`❌ ${route} - MISSING`);
      }
    }

    // Validate database queries that the APIs would use
    console.log('\n🗃️ Testing Database Queries (API Simulation):');
    console.log('===============================================');

    // Test 1: Get teacher with students (teacher dashboard query)
    console.log('\n1. Testing Teacher Dashboard Query:');
    const teacherWithStudents = await prisma.user.findMany({
      where: {
        isTeacher: true,
      },
      include: {
        assignedStudents: {
          include: {
            subscriptions: {
              include: {
                package: true,
              },
            },
          },
        },
        studentConnections: {
          include: {
            student: {
              include: {
                subscriptions: {
                  include: {
                    package: true,
                  },
                },
              },
            },
          },
          where: {
            isActive: true,
          },
        },
      },
    });

    if (teacherWithStudents.length > 0) {
      console.log(
        `✅ Teacher dashboard query successful - Found ${teacherWithStudents.length} teachers`
      );
      teacherWithStudents.forEach((teacher) => {
        console.log(
          `   - ${teacher.name}: ${teacher.assignedStudents.length} primary students, ${teacher.studentConnections.length} total connections`
        );
      });
    } else {
      console.log(`❌ No teachers found for dashboard query`);
    }

    // Test 2: Get student with teachers (student dashboard query)
    console.log('\n2. Testing Student Dashboard Query:');
    const studentsWithTeachers = await prisma.user.findMany({
      where: {
        isTeacher: false,
      },
      include: {
        assignedTeacher: true,
        teacherConnections: {
          include: {
            teacher: true,
          },
          where: {
            isActive: true,
          },
        },
        subscriptions: {
          include: {
            package: true,
          },
        },
      },
    });

    if (studentsWithTeachers.length > 0) {
      console.log(
        `✅ Student dashboard query successful - Found ${studentsWithTeachers.length} students`
      );
      studentsWithTeachers.forEach((student) => {
        const primaryTeacher = student.assignedTeacher?.name || 'None';
        const additionalTeachers = student.teacherConnections.length;
        const subscriptions = student.subscriptions.length;
        console.log(
          `   - ${student.name}: Primary teacher: ${primaryTeacher}, Additional: ${additionalTeachers}, Subscriptions: ${subscriptions}`
        );
      });
    } else {
      console.log(`❌ No students found for dashboard query`);
    }

    // Test 3: Admin assignment query
    console.log('\n3. Testing Admin Assignment Capabilities:');
    const availableTeachers = await prisma.user.findMany({
      where: {
        isTeacher: true,
      },
      include: {
        _count: {
          select: {
            assignedStudents: true,
            studentConnections: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    const unassignedStudents = await prisma.user.findMany({
      where: {
        isTeacher: false,
        assignedTeacherId: null,
      },
    });

    console.log(
      `✅ Available teachers for assignment: ${availableTeachers.length}`
    );
    availableTeachers.forEach((teacher) => {
      console.log(
        `   - ${teacher.name}: ${teacher._count.assignedStudents} primary students, ${teacher._count.studentConnections} total connections`
      );
    });

    console.log(`✅ Unassigned students: ${unassignedStudents.length}`);
    unassignedStudents.forEach((student) => {
      console.log(`   - ${student.name} (${student.email})`);
    });

    // Test 4: Relationship management queries
    console.log('\n4. Testing Relationship Management:');

    // Test creating a new relationship (dry run)
    const sampleTeacher = availableTeachers[0];
    const sampleStudent = unassignedStudents[0];

    if (sampleTeacher && sampleStudent) {
      console.log(
        `✅ Relationship creation possible: ${sampleTeacher.name} ↔ ${sampleStudent.name}`
      );

      // Check if relationship already exists
      const existingRelation = await prisma.teacherStudent.findUnique({
        where: {
          teacherId_studentId: {
            teacherId: sampleTeacher.id,
            studentId: sampleStudent.id,
          },
        },
      });

      if (existingRelation) {
        console.log(`   ℹ️ Relationship already exists`);
      } else {
        console.log(`   ✅ New relationship can be created`);
      }
    } else {
      console.log(
        `   ⚠️ No available teacher-student pairs for new relationships`
      );
    }

    // Test 5: Flow completion validation
    console.log('\n5. Testing Flow Completion Status:');

    const teacherFlowStats = {
      totalTeachers: teacherWithStudents.length,
      teachersWithCompleteProfile: teacherWithStudents.filter(
        (t) => t.name && t.email && t.phone && t.subjects && t.qualifications
      ).length,
      teachersWithStudents: teacherWithStudents.filter(
        (t) => t.assignedStudents.length > 0 || t.studentConnections.length > 0
      ).length,
    };

    const studentFlowStats = {
      totalStudents: studentsWithTeachers.length,
      studentsWithCompleteProfile: studentsWithTeachers.filter(
        (s) => s.name && s.email
      ).length,
      studentsWithTeachers: studentsWithTeachers.filter(
        (s) => s.assignedTeacher || s.teacherConnections.length > 0
      ).length,
      studentsWithSubscriptions: studentsWithTeachers.filter(
        (s) => s.subscriptions.length > 0
      ).length,
    };

    console.log('Teacher Flow Statistics:');
    console.log(`├── Total Teachers: ${teacherFlowStats.totalTeachers}`);
    console.log(
      `├── Complete Profiles: ${teacherFlowStats.teachersWithCompleteProfile}/${teacherFlowStats.totalTeachers}`
    );
    console.log(
      `└── With Students: ${teacherFlowStats.teachersWithStudents}/${teacherFlowStats.totalTeachers}`
    );

    console.log('Student Flow Statistics:');
    console.log(`├── Total Students: ${studentFlowStats.totalStudents}`);
    console.log(
      `├── Complete Profiles: ${studentFlowStats.studentsWithCompleteProfile}/${studentFlowStats.totalStudents}`
    );
    console.log(
      `├── With Teachers: ${studentFlowStats.studentsWithTeachers}/${studentFlowStats.totalStudents}`
    );
    console.log(
      `└── With Subscriptions: ${studentFlowStats.studentsWithSubscriptions}/${studentFlowStats.totalStudents}`
    );

    // Calculate completion percentages
    const teacherFlowCompletion =
      teacherFlowStats.totalTeachers > 0
        ? (teacherFlowStats.teachersWithCompleteProfile /
            teacherFlowStats.totalTeachers) *
          100
        : 0;

    const studentFlowCompletion =
      studentFlowStats.totalStudents > 0
        ? (studentFlowStats.studentsWithCompleteProfile /
            studentFlowStats.totalStudents) *
          100
        : 0;

    const relationshipCompletion =
      studentFlowStats.totalStudents > 0
        ? (studentFlowStats.studentsWithTeachers /
            studentFlowStats.totalStudents) *
          100
        : 0;

    console.log('\n📊 COMPLETION METRICS:');
    console.log('======================');
    console.log(
      `Teacher Flow Completion: ${teacherFlowCompletion.toFixed(1)}%`
    );
    console.log(
      `Student Flow Completion: ${studentFlowCompletion.toFixed(1)}%`
    );
    console.log(
      `Relationship Establishment: ${relationshipCompletion.toFixed(1)}%`
    );

    // Final assessment
    const allFlowsComplete =
      teacherFlowCompletion === 100 &&
      studentFlowCompletion === 100 &&
      relationshipCompletion === 100;

    console.log('\n🎯 FINAL ASSESSMENT:');
    console.log('====================');
    console.log(
      `Overall Status: ${allFlowsComplete ? '✅ ALL FLOWS COMPLETE' : '⚠️ FLOWS PARTIALLY COMPLETE'}`
    );

    if (!allFlowsComplete) {
      console.log('\n🔧 RECOMMENDATIONS:');
      console.log('===================');

      if (teacherFlowCompletion < 100) {
        console.log(
          '• Complete teacher profiles (add missing phone, subjects, qualifications)'
        );
      }

      if (studentFlowCompletion < 100) {
        console.log(
          '• Complete student profiles (add missing required fields)'
        );
      }

      if (relationshipCompletion < 100) {
        console.log('• Assign teachers to all students');
        console.log('• Create teacher-student relationships in the system');
      }

      if (
        studentFlowStats.studentsWithSubscriptions <
        studentFlowStats.totalStudents
      ) {
        console.log('• Add subscriptions for students who need them');
      }
    }

    return allFlowsComplete;
  } catch (error) {
    console.error('❌ Error during API validation:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the API validation
validateAPIEndpoints()
  .then((success) => {
    console.log(
      `\n${success ? '✅' : '❌'} API Validation ${success ? 'PASSED' : 'FAILED'}`
    );
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ API Validation failed:', error);
    process.exit(1);
  });
