import {
  CompanyAddress,
  CompanyBranding,
  CompanyContact,
  CompanySettings,
  StorageUsage,
  SubscriptionDetails,
} from '../types/company.types';

export class CompanyResponseDto {
  id: string;

  companyName: string;

  legalName: string;

  companyCode: string;

  companyType: string;

  status: string;

  gstNumber?: string;

  panNumber?: string;

  cinNumber?: string;

  msmeNumber?: string;

  email: string;

  phone: string;

  alternatePhone?: string;

  website?: string;

  address: CompanyAddress;

  contact: CompanyContact;

  branding: CompanyBranding;

  subscription: SubscriptionDetails;

  settings: CompanySettings;

  storage: StorageUsage;

  tenantId: string;

  emailVerified: boolean;

  phoneVerified: boolean;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date | null;
}
