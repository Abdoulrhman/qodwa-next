// Auth Types
export type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

export type AuthSession = {
  user: User;
  expires: string;
};

// Stripe Types
export type StripeCheckoutItem = {
  name: string;
  price: number;
  quantity: number;
  packageId: number;
};

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

// Response Types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
