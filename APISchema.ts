export type Package = {
  id: number;
  current_price: string;
  original_price: string;
  discount: string;
  subscription_frequency: string;
  days_per_week: string;
  classes_per_month: string;
  class_duration: string;
  enrollment_action: string;
  package_type: string;
  description?: string;
};

export type PackagesResponse = {
  thirtyMinutes: Package[];
  sixtyMinutes: Package[];
};
