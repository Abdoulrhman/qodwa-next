/**
 * Database Configuration
 */

export const DATABASE_CONFIG = {
  // Connection settings
  connection: {
    url: process.env.DATABASE_URL!,
    timeout: 20000,
    pool: {
      min: 2,
      max: 10,
    },
  },

  // Seed configuration
  seed: {
    adminEmail: 'admin@qodwa.com',
    defaultPassword: 'admin123',
  },

  // Backup settings
  backup: {
    enabled: process.env.NODE_ENV === 'production',
    schedule: '0 2 * * *', // Daily at 2 AM
  },
} as const;
