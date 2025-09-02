# Qodwa Admin User Management Scripts

This directory contains several scripts for managing admin users in the Qodwa application.

## Available Scripts

### 1. 🚀 Quick Admin Creation (`quick-admin.js`)

**Purpose**: Create an admin user quickly with minimal input.

```bash
# Use default credentials
node scripts/quick-admin.js

# Specify email only
node scripts/quick-admin.js admin@example.com

# Specify email and name
node scripts/quick-admin.js admin@example.com "John Admin"

# Specify all details
node scripts/quick-admin.js admin@example.com "John Admin" "securepassword123"
```

**Features**:

- ✅ Creates new admin user or updates existing user
- ✅ Automatic password hashing
- ✅ Email verification set
- ✅ Default credentials for quick setup

### 2. 🔧 Interactive Admin Creation (`create-admin.js`)

**Purpose**: Interactive script with prompts for creating admin users.

```bash
node scripts/create-admin.js
```

**Features**:

- ✅ Interactive prompts for all details
- ✅ Hidden password input
- ✅ Email validation
- ✅ Password confirmation
- ✅ Additional operations menu
- ✅ List existing admins
- ✅ Remove admin roles

### 3. 👑 Make User Admin (`make-admin.js`)

**Purpose**: Promote an existing user to admin role.

```bash
# List available users
node scripts/make-admin.js

# Make specific user admin
node scripts/make-admin.js user@example.com
```

**Features**:

- ✅ Shows available non-admin users
- ✅ Promotes existing user to admin
- ✅ Verifies email automatically
- ✅ Shows statistics

### 4. 👥 List Users (`list-users.js`)

**Purpose**: List all users or filter by role.

```bash
# List all users
node scripts/list-users.js

# List only admins
node scripts/list-users.js ADMIN

# List only teachers
node scripts/list-users.js TEACHER

# List only regular users
node scripts/list-users.js USER
```

**Features**:

- ✅ Role-based filtering
- ✅ Detailed user information
- ✅ Summary statistics
- ✅ Grouped by role display

## Default Admin Credentials

⚠️ **Security Warning**: The quick-admin script uses default credentials for development. **Always change these in production!**

```
Email: admin@qodwa.com
Password: admin123456
```

## Usage Examples

### First-time Setup

```bash
# Create your first admin user interactively
node scripts/create-admin.js

# Or use quick setup (development only)
node scripts/quick-admin.js your-email@domain.com "Your Name" "secure-password"
```

### Promote Existing User

```bash
# See available users
node scripts/make-admin.js

# Make specific user admin
node scripts/make-admin.js user@example.com
```

### Check Current Users

```bash
# List all users
node scripts/list-users.js

# Check only admins
node scripts/list-users.js ADMIN
```

## Security Best Practices

1. **Change Default Passwords**: Always change default passwords after first login
2. **Use Strong Passwords**: Minimum 8 characters with mixed case, numbers, and symbols
3. **Verify Email**: Ensure admin email addresses are verified
4. **Limit Admin Access**: Only create admin users when necessary
5. **Regular Audits**: Periodically review admin users using `list-users.js`

## Troubleshooting

### Database Connection Issues

```bash
# Make sure your DATABASE_URL is set correctly in .env
echo $DATABASE_URL

# Test database connection
npx prisma db pull
```

### Permission Errors

```bash
# Make scripts executable (Linux/Mac)
chmod +x scripts/*.js

# Run with node explicitly
node scripts/create-admin.js
```

### User Already Exists

- Use `make-admin.js` to promote existing users
- Use `create-admin.js` and choose to update existing user

### Password Issues

- Minimum 6 characters required
- Passwords are automatically hashed with bcrypt
- Use strong passwords for production

## Script Dependencies

All scripts require:

- Node.js
- Prisma Client
- bcryptjs (for password hashing)
- Database connection

## Help

For help with any script, use the `--help` flag:

```bash
node scripts/create-admin.js --help
node scripts/quick-admin.js --help
node scripts/make-admin.js --help
node scripts/list-users.js --help
```

---

**Need help?** Contact the development team or check the main project README.
