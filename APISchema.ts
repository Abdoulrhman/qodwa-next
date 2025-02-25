export type Package = {
  id: number;
  package_id: number;
  price: string; // Represents "current_price" in previous versions
  currency: string; // "USD"
  days: number; // Number of days per week
  duration: number; // Class duration in minutes (30 or 60)
  is_popular: boolean;
};

export type PackagesResponse = {
  monthly: Package[];
  quarterly: Package[];
  'half-year': Package[];
  yearly: Package[];
};
