/**
 * -------------------------------------------------------
 * COMPANY ADDRESS
 * -------------------------------------------------------
 */

export interface CompanyAddress {
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * -------------------------------------------------------
 * COMPANY CONTACT
 * -------------------------------------------------------
 */

export interface CompanyContact {
  name: string;
  designation?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
}

/**
 * -------------------------------------------------------
 * COMPANY BRANDING
 * -------------------------------------------------------
 */

export interface CompanyBranding {
  logo?: string;
  favicon?: string;
  primaryColor?: string;
  secondaryColor?: string;
  website?: string;
}

/**
 * -------------------------------------------------------
 * SUBSCRIPTION DETAILS
 * -------------------------------------------------------
 */

export interface SubscriptionDetails {
  plan: string;
  startDate: Date;
  expiryDate: Date;
  isTrial: boolean;
  storageLimit: number;
  warehouseLimit: number;
  userLimit: number;
  apiLimit: number;
}

/**
 * -------------------------------------------------------
 * STORAGE USAGE
 * -------------------------------------------------------
 */

export interface StorageUsage {
  totalStorageGB: number;
  usedStorageGB: number;
  remainingStorageGB: number;
  usagePercentage: number;
}

/**
 * -------------------------------------------------------
 * COMPANY SETTINGS
 * -------------------------------------------------------
 */

export interface CompanySettings {
  timezone: string;
  currency: string;
  language: string;

  autoAssignOrders: boolean;
  recordingEnabled: boolean;
  aiVerificationEnabled: boolean;
  notificationsEnabled: boolean;
  barcodeValidation: boolean;
}

/**
 * -------------------------------------------------------
 * COMPANY STATISTICS
 * -------------------------------------------------------
 */

export interface CompanyStatistics {
  totalUsers: number;
  totalWarehouses: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalClaims: number;
  totalReturns: number;
  storageUsed: number;
}

/**
 * -------------------------------------------------------
 * COMPANY DASHBOARD
 * -------------------------------------------------------
 */

export interface CompanyDashboardSummary {
  statistics: CompanyStatistics;
  subscription: SubscriptionDetails;
  storage: StorageUsage;
}

/**
 * -------------------------------------------------------
 * COMPANY FILTER
 * -------------------------------------------------------
 */

export interface CompanyFilter {
  search?: string;

  status?: string;

  companyType?: string;

  subscriptionPlan?: string;

  city?: string;

  state?: string;

  country?: string;

  createdAfter?: Date;

  createdBefore?: Date;

  page?: number;

  limit?: number;

  sortBy?: string;

  sortOrder?: 'asc' | 'desc';
}

/**
 * -------------------------------------------------------
 * SEARCH RESULT
 * -------------------------------------------------------
 */

export interface CompanySearchResult<T> {
  data: T[];

  total: number;

  page: number;

  limit: number;

  totalPages: number;
}

/**
 * -------------------------------------------------------
 * AUDIT METADATA
 * -------------------------------------------------------
 */

export interface CompanyAuditMetadata {
  action: string;

  performedBy: string;

  performedAt: Date;

  ipAddress?: string;

  userAgent?: string;

  remarks?: string;
}
