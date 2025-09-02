// Load environment variables
const fs = require('fs');
const path = require('path');

function loadEnv() {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');

    envContent.split('\n').forEach((line) => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=');
          value = value.replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.log('Could not load .env file:', error.message);
  }
}

loadEnv();

const { Resend } = require('resend');

async function testAdminNotification() {
  console.log('🧪 Testing Admin Notification System...\n');

  const resend = new Resend(process.env.RESEND_API_KEY);

  // Test with a fake student registration
  const testStudent = {
    id: 'test_' + Date.now(),
    name: 'Ahmed Test Student',
    email: 'ahmed.test@example.com',
    role: 'STUDENT',
    createdAt: new Date(),
  };

  try {
    console.log('📧 Sending student registration notification...');

    const studentEmailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [process.env.ADMIN_NOTIFICATION_EMAIL],
      subject: '👨‍🎓 New Student Registration - Qodwa Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1f2937; margin: 0;">🎓 Qodwa Platform</h1>
              <p style="color: #6b7280; margin: 10px 0;">Admin Notification System</p>
            </div>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h2 style="color: #1e40af; margin: 0 0 15px 0;">👨‍🎓 New Student Registration</h2>
              <p style="color: #374151; margin: 5px 0;"><strong>Name:</strong> ${testStudent.name}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> ${testStudent.email}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Role:</strong> ${testStudent.role}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Registration Time:</strong> ${testStudent.createdAt.toLocaleString()}</p>
            </div>
            
            <div style="margin: 25px 0; text-align: center;">
              <a href="http://localhost:3000/dashboard/admin/users" 
                 style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View in Admin Panel
              </a>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">This is an automated notification from Qodwa Platform</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('✅ Student notification sent successfully!');
    console.log('📧 Email ID:', studentEmailResult.data?.id);
  } catch (error) {
    console.log('❌ Error sending student notification:', error.message);
  }

  // Test with a fake teacher application
  const testTeacher = {
    id: 'test_teacher_' + Date.now(),
    name: 'Sarah Test Teacher',
    email: 'sarah.teacher@example.com',
    role: 'TEACHER',
    createdAt: new Date(),
    isApproved: false,
  };

  try {
    console.log('\n📧 Sending teacher application notification...');

    const teacherEmailResult = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [process.env.ADMIN_NOTIFICATION_EMAIL],
      subject: '👩‍🏫 New Teacher Application - Qodwa Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1f2937; margin: 0;">🎓 Qodwa Platform</h1>
              <p style="color: #6b7280; margin: 10px 0;">Admin Notification System</p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h2 style="color: #92400e; margin: 0 0 15px 0;">👩‍🏫 New Teacher Application</h2>
              <p style="color: #374151; margin: 5px 0;"><strong>Name:</strong> ${testTeacher.name}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Email:</strong> ${testTeacher.email}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Role:</strong> ${testTeacher.role}</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Status:</strong> Pending Approval</p>
              <p style="color: #374151; margin: 5px 0;"><strong>Application Time:</strong> ${testTeacher.createdAt.toLocaleString()}</p>
            </div>
            
            <div style="margin: 25px 0; text-align: center;">
              <a href="http://localhost:3000/dashboard/admin/users" 
                 style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Review Application
              </a>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">This is an automated notification from Qodwa Platform</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('✅ Teacher notification sent successfully!');
    console.log('📧 Email ID:', teacherEmailResult.data?.id);
  } catch (error) {
    console.log('❌ Error sending teacher notification:', error.message);
  }

  console.log(
    '\n🎉 Test completed! Check your email at',
    process.env.ADMIN_NOTIFICATION_EMAIL
  );
  console.log('📬 You should receive 2 test emails:');
  console.log('   1. Student registration notification');
  console.log('   2. Teacher application notification');
}

testAdminNotification();

async function testAdminNotification() {
  console.log('🧪 Testing Admin Notification System...\n');

  // Test with a fake student registration
  const testStudent = {
    id: 'test_' + Date.now(),
    name: 'Ahmed Test Student',
    email: 'ahmed.test@example.com',
    role: 'STUDENT',
    createdAt: new Date(),
  };

  try {
    console.log('📧 Sending student registration notification...');
    await sendAdminNotification(testStudent);
    console.log('✅ Student notification sent successfully!');
  } catch (error) {
    console.log('❌ Error sending student notification:', error.message);
  }

  // Test with a fake teacher application
  const testTeacher = {
    id: 'test_teacher_' + Date.now(),
    name: 'Sarah Test Teacher',
    email: 'sarah.teacher@example.com',
    role: 'TEACHER',
    createdAt: new Date(),
    isApproved: false,
  };

  try {
    console.log('\n📧 Sending teacher application notification...');
    await sendAdminNotification(testTeacher);
    console.log('✅ Teacher notification sent successfully!');
  } catch (error) {
    console.log('❌ Error sending teacher notification:', error.message);
  }

  console.log(
    '\n🎉 Test completed! Check your email at abdoulrhman_salah@hotmail.com'
  );
}

testAdminNotification();
