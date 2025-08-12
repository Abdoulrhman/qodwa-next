// Auth feature exports
export * from './actions/login';
export * from './actions/logout';
export * from './actions/register';
export * from './actions/reset';
export * from './actions/new-password';
export * from './actions/new-verification';

export * from './hooks/use-current-role';
export * from './hooks/use-current-user';
export * from './hooks/use-current-user-role';

// Re-export components
export { LoginForm } from './components/login-form';
export { RegisterForm } from './components/register-form';
export { ResetForm } from './components/reset-form';
export { NewPasswordForm } from './components/new-password-form';
export { NewVerificationForm } from './components/new-verification-form';
export { LoginButton } from './components/login-button';
export { LogoutButton } from './components/logout-button';
export { UserButton } from './components/user-button';
export { AuthGuard } from './components/auth-guard';
export { RoleGate } from './components/role-gate';
