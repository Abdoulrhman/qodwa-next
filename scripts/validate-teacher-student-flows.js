const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateTeacherStudentFlows() {
  try {
    console.log('🔍 Starting validation of teacher-student flows...\n');

    // 1. Validate Teacher Flow Completion
    console.log('👨‍🏫 VALIDATING TEACHER FLOW:');
    console.log('============================');

    const teachers = await prisma.user.findMany({
      where: {
        isTeacher: true,
      },
      include: {
        assignedStudents: true,
        studentConnections: {
          include: {
            student: true,
          },
          where: {
            isActive: true,
          },
        },
        subscriptions: true,
      },
    });

    if (teachers.length === 0) {
      console.log('❌ No teachers found in the system');
      return false;
    }

    console.log(`✅ Found ${teachers.length} teacher(s):`);

    let teacherFlowValid = true;
    for (const teacher of teachers) {
      console.log(`\n📋 Teacher: ${teacher.name} (${teacher.email})`);
      console.log(`   - ID: ${teacher.id}`);
      console.log(`   - Phone: ${teacher.phone || 'Not set'}`);
      console.log(`   - Subjects: ${teacher.subjects || 'Not set'}`);
      console.log(
        `   - Experience: ${teacher.teachingExperience || 'Not set'} years`
      );
      console.log(
        `   - Qualifications: ${teacher.qualifications || 'Not set'}`
      );
      console.log(`   - Role: ${teacher.role}`);
      console.log(
        `   - Email Verified: ${teacher.emailVerified ? 'Yes' : 'No'}`
      );

      // Validate required teacher fields
      const requiredFields = [
        'name',
        'email',
        'phone',
        'subjects',
        'qualifications',
      ];
      const missingFields = requiredFields.filter((field) => !teacher[field]);

      if (missingFields.length > 0) {
        console.log(
          `   ❌ Missing required fields: ${missingFields.join(', ')}`
        );
        teacherFlowValid = false;
      } else {
        console.log(`   ✅ All required fields completed`);
      }

      // Check assigned students
      console.log(
        `   - Primary assigned students: ${teacher.assignedStudents.length}`
      );
      console.log(
        `   - Additional student connections: ${teacher.studentConnections.length}`
      );

      if (
        teacher.assignedStudents.length === 0 &&
        teacher.studentConnections.length === 0
      ) {
        console.log(`   ⚠️ Teacher has no students assigned`);
      }
    }

    // 2. Validate Student Flow Completion
    console.log('\n👥 VALIDATING STUDENT FLOW:');
    console.log('===========================');

    const students = await prisma.user.findMany({
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

    if (students.length === 0) {
      console.log('❌ No students found in the system');
      return false;
    }

    console.log(`✅ Found ${students.length} student(s):`);

    let studentFlowValid = true;
    for (const student of students) {
      console.log(`\n📋 Student: ${student.name} (${student.email})`);
      console.log(`   - ID: ${student.id}`);
      console.log(`   - Phone: ${student.phone || 'Not set'}`);
      console.log(`   - Gender: ${student.gender || 'Not set'}`);
      console.log(
        `   - Birth Date: ${student.birthDate ? student.birthDate.toDateString() : 'Not set'}`
      );
      console.log(`   - Role: ${student.role}`);
      console.log(
        `   - Email Verified: ${student.emailVerified ? 'Yes' : 'No'}`
      );

      // Validate required student fields
      const requiredFields = ['name', 'email'];
      const missingFields = requiredFields.filter((field) => !student[field]);

      if (missingFields.length > 0) {
        console.log(
          `   ❌ Missing required fields: ${missingFields.join(', ')}`
        );
        studentFlowValid = false;
      } else {
        console.log(`   ✅ All required fields completed`);
      }

      // Check teacher assignments
      if (student.assignedTeacher) {
        console.log(
          `   ✅ Primary teacher assigned: ${student.assignedTeacher.name}`
        );
      } else {
        console.log(`   ❌ No primary teacher assigned`);
        studentFlowValid = false;
      }

      if (student.teacherConnections.length > 0) {
        console.log(
          `   ✅ Additional teacher connections: ${student.teacherConnections.length}`
        );
        student.teacherConnections.forEach((conn) => {
          console.log(
            `      - ${conn.teacher.name} (${conn.notes || 'No notes'})`
          );
        });
      } else {
        console.log(`   ℹ️ No additional teacher connections`);
      }

      // Check subscriptions
      if (student.subscriptions.length > 0) {
        console.log(
          `   ✅ Active subscriptions: ${student.subscriptions.length}`
        );
        student.subscriptions.forEach((sub) => {
          console.log(
            `      - Package: ${sub.package.title || 'Package ' + sub.packageId} (Status: ${sub.status})`
          );
        });
      } else {
        console.log(`   ⚠️ No subscriptions found`);
      }
    }

    // 3. Validate Relationship Integrity
    console.log('\n🔗 VALIDATING RELATIONSHIP INTEGRITY:');
    console.log('=====================================');

    // Check for orphaned relationships
    const teacherStudentRelations = await prisma.teacherStudent.findMany({
      include: {
        teacher: true,
        student: true,
      },
    });

    console.log(
      `✅ Found ${teacherStudentRelations.length} teacher-student relationship(s):`
    );

    let relationshipIntegrity = true;
    for (const relation of teacherStudentRelations) {
      console.log(
        `\n🔗 Relationship: ${relation.teacher.name} ↔ ${relation.student.name}`
      );
      console.log(`   - Created: ${relation.assignedAt.toDateString()}`);
      console.log(`   - Active: ${relation.isActive ? 'Yes' : 'No'}`);
      console.log(`   - Notes: ${relation.notes || 'None'}`);

      // Validate teacher exists and is actually a teacher
      if (!relation.teacher.isTeacher) {
        console.log(
          `   ❌ User ${relation.teacher.name} is not marked as a teacher`
        );
        relationshipIntegrity = false;
      }

      // Validate student exists and is not a teacher
      if (relation.student.isTeacher) {
        console.log(
          `   ❌ User ${relation.student.name} is marked as a teacher but assigned as student`
        );
        relationshipIntegrity = false;
      }
    }

    // Check for students with primary teacher assignment but no corresponding TeacherStudent record
    const studentsWithPrimaryTeacher = await prisma.user.findMany({
      where: {
        isTeacher: false,
        assignedTeacherId: {
          not: null,
        },
      },
      include: {
        assignedTeacher: true,
        teacherConnections: true,
      },
    });

    console.log(`\n🔍 Checking primary teacher assignments...`);
    for (const student of studentsWithPrimaryTeacher) {
      const hasCorrespondingRelation = student.teacherConnections.some(
        (conn) => conn.teacherId === student.assignedTeacherId
      );

      if (!hasCorrespondingRelation) {
        console.log(
          `   ⚠️ Student ${student.name} has primary teacher ${student.assignedTeacher.name} but no corresponding TeacherStudent record`
        );
      } else {
        console.log(
          `   ✅ Student ${student.name} primary teacher assignment is properly tracked`
        );
      }
    }

    // 4. Summary Report
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log('======================');

    const totalUsers = teachers.length + students.length;
    const usersWithVerifiedEmail = [...teachers, ...students].filter(
      (u) => u.emailVerified
    ).length;
    const studentsWithTeachers = students.filter(
      (s) => s.assignedTeacher
    ).length;
    const teachersWithStudents = teachers.filter(
      (t) => t.assignedStudents.length > 0
    ).length;

    console.log(`Total Users: ${totalUsers}`);
    console.log(`├── Teachers: ${teachers.length}`);
    console.log(`├── Students: ${students.length}`);
    console.log(`└── Verified Emails: ${usersWithVerifiedEmail}/${totalUsers}`);
    console.log('');
    console.log(`Teacher-Student Assignments:`);
    console.log(
      `├── Students with assigned teachers: ${studentsWithTeachers}/${students.length}`
    );
    console.log(
      `├── Teachers with assigned students: ${teachersWithStudents}/${teachers.length}`
    );
    console.log(`└── Total relationships: ${teacherStudentRelations.length}`);

    const overallValid =
      teacherFlowValid && studentFlowValid && relationshipIntegrity;

    console.log('\n🎯 FINAL RESULT:');
    console.log('================');
    console.log(
      `Teacher Flow: ${teacherFlowValid ? '✅ VALID' : '❌ INVALID'}`
    );
    console.log(
      `Student Flow: ${studentFlowValid ? '✅ VALID' : '❌ INVALID'}`
    );
    console.log(
      `Relationship Integrity: ${relationshipIntegrity ? '✅ VALID' : '❌ INVALID'}`
    );
    console.log(
      `Overall Status: ${overallValid ? '✅ ALL FLOWS COMPLETED SUCCESSFULLY' : '❌ ISSUES FOUND - REQUIRES ATTENTION'}`
    );

    return overallValid;
  } catch (error) {
    console.error('❌ Error during validation:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
validateTeacherStudentFlows()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
