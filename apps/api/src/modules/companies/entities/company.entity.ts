import {
  CompanyAddress,
  CompanyBranding,
  CompanyContact,
  CompanySettings,
  StorageUsage,
  SubscriptionDetails,
} from '../types/company.types';

export class CompanyEntity {
  id: string;

  /**
   * -------------------------------------------------------
   * BASIC INFORMATION
   * -------------------------------------------------------
   */

  companyName: string;

  legalName: string;

  companyCode: string;

  companyType: string;

  status: string;

  /**
   * -------------------------------------------------------
   * REGISTRATION
   * -------------------------------------------------------
   */

  gstNumber?: string;

  panNumber?: string;

  cinNumber?: string;

  msmeNumber?: string;

  /**
   * -------------------------------------------------------
   * CONTACT
   * -------------------------------------------------------
   */

  email: string;

  phone: string;

  alternatePhone?: string;

  website?: string;

  /**
   * -------------------------------------------------------
   * ADDRESS
   * -------------------------------------------------------
   */

  address: CompanyAddress;

  /**
   * -------------------------------------------------------
   * PRIMARY CONTACT
   * -------------------------------------------------------
   */

  contact: CompanyContact;

  /**
   * -------------------------------------------------------
   * BRANDING
   * -------------------------------------------------------
   */

  branding: CompanyBranding;

  /**
   * -------------------------------------------------------
   * SUBSCRIPTION
   * -------------------------------------------------------
   */

  subscription: SubscriptionDetails;

  /**
   * -------------------------------------------------------
   * SETTINGS
   * -------------------------------------------------------
   */

  settings: CompanySettings;

  /**
   * -------------------------------------------------------
   * STORAGE
   * -------------------------------------------------------
   */

  storage: StorageUsage;

  /**
   * -------------------------------------------------------
   * MULTI-TENANT
   * -------------------------------------------------------
   */

  tenantId: string;

  apiKey?: string;

  apiSecret?: string;

  /**
   * -------------------------------------------------------
   * FLAGS
   * -------------------------------------------------------
   */

  emailVerified: boolean;

  phoneVerified: boolean;

  isDeleted: boolean;

  /**
   * -------------------------------------------------------
   * AUDIT
   * -------------------------------------------------------
   */

  createdBy?: string;

  updatedBy?: string;

  deletedBy?: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date | null;
}