export type Package = {
  weekly: string;
  price: number;
  frequency: string;
  details: string;
  sixMonths: number;
  twelveMonths: number;
};

export type PackagesResponse = {
  thirtyMinutes: Package[];
  sixtyMinutes: Package[];
};
