#!/usr/bin/env node
/**
 * List Users Script
 * Usage: node scripts/list-users.js [role]
 *
 * This script lists all users or users with a specific role.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUsers() {
  console.log('👥 User List');
  console.log('============\n');

  try {
    const targetRole = process.argv[2]?.toUpperCase();

    // Build where clause
    const whereClause = targetRole ? { role: targetRole } : {};

    // Get users
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        isTeacher: true,
        teacherApprovalStatus: true,
      },
      orderBy: {
        role: 'asc',
      },
    });

    if (users.length === 0) {
      console.log(
        `❌ No users found${targetRole ? ` with role "${targetRole}"` : ''}.`
      );
      return;
    }

    console.log(
      `📊 Found ${users.length} user${users.length === 1 ? '' : 's'}${targetRole ? ` with role "${targetRole}"` : ''}:\n`
    );

    // Group users by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user);
      return acc;
    }, {});

    // Display users grouped by role
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      const roleEmoji = {
        ADMIN: '👑',
        TEACHER: '👨‍🏫',
        USER: '👤',
      };

      console.log(`${roleEmoji[role] || '👤'} ${role} (${roleUsers.length})`);
      console.log('─'.repeat(40));

      roleUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'No name'}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   ✅ Verified: ${user.emailVerified ? 'Yes' : 'No'}`);

        if (user.role === 'TEACHER') {
          console.log(`   👨‍🏫 Teacher: ${user.isTeacher ? 'Yes' : 'No'}`);
          console.log(`   📋 Status: ${user.teacherApprovalStatus || 'N/A'}`);
        }

        console.log('');
      });
    });

    // Show summary statistics
    const stats = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    console.log('📈 Summary:');
    console.log('─'.repeat(20));
    stats.forEach((stat) => {
      const emoji = {
        ADMIN: '👑',
        TEACHER: '👨‍🏫',
        USER: '👤',
      };
      console.log(
        `${emoji[stat.role] || '👤'} ${stat.role}: ${stat._count.role}`
      );
    });

    const totalUsers = await prisma.user.count();
    console.log(`👥 Total: ${totalUsers}`);
  } catch (error) {
    console.error('\n❌ Error listing users:', error.message);
    process.exit(1);
  }
}

// Show usage if help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('List Users Script');
  console.log('=================');
  console.log('');
  console.log('Usage: node scripts/list-users.js [role]');
  console.log('');
  console.log('Parameters:');
  console.log('  role    Optional. Filter by role: ADMIN, TEACHER, or USER');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/list-users.js           # List all users');
  console.log('  node scripts/list-users.js ADMIN     # List only admin users');
  console.log(
    '  node scripts/list-users.js TEACHER   # List only teacher users'
  );
  console.log(
    '  node scripts/list-users.js USER      # List only regular users'
  );
  process.exit(0);
}

// Run the script
listUsers()
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
