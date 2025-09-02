// Test script to verify localized email URLs
const { createLocalizedUrl } = require('./lib/mail');

console.log('Testing localized URL generation:');
console.log(
  'Password reset:',
  createLocalizedUrl('/auth/new-password?token=test123')
);
console.log(
  'Email verification:',
  createLocalizedUrl('/auth/new-verification?token=test456')
);
console.log('Dashboard:', createLocalizedUrl('/dashboard'));
console.log('Teacher dashboard:', createLocalizedUrl('/dashboard/teacher'));

// Test with different locale
console.log('\nWith Arabic locale:');
console.log(
  'Password reset (ar):',
  createLocalizedUrl('/auth/new-password?token=test123', 'ar')
);
console.log(
  'Email verification (ar):',
  createLocalizedUrl('/auth/new-verification?token=test456', 'ar')
);
