export type Package = {
  id: number;
  current_price: string;
  original_price: string;
  discount: string;
  subscription_frequency: string;
  days: number;
  class_duration: number;
  total_classes: number | null;
  duration_weeks: number | null;
  subject: string | null;
  level: string | null;
  features: string[];
  title: string | null;
  description: string | null;
  enrollment_action: string;
  package_type: string;
  currency: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number | null;
};

export type PackagesResponse = {
  monthly: Package[];
  quarterly: Package[];
  'half-year': Package[];
  yearly: Package[];
};

export type SubscriptionFrequency =
  | 'monthly'
  | 'quarterly'
  | 'half-year'
  | 'yearly';

export type PackageLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type PackageType = 'basic' | 'standard' | 'premium' | 'ultimate';
