import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
  CompanyAddress,
  CompanyBranding,
  CompanyContact,
  CompanySettings,
  StorageUsage,
  SubscriptionDetails,
} from '../types/company.types';

export class CreateCompanyDto {
  /**
   * -------------------------------------------------------
   * BASIC INFORMATION
   * -------------------------------------------------------
   */

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsString()
  @IsNotEmpty()
  companyCode: string;

  @IsString()
  @IsNotEmpty()
  companyType: string;

  /**
   * -------------------------------------------------------
   * REGISTRATION DETAILS
   * -------------------------------------------------------
   */

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  panNumber?: string;

  @IsOptional()
  @IsString()
  cinNumber?: string;

  @IsOptional()
  @IsString()
  msmeNumber?: string;

  /**
   * -------------------------------------------------------
   * CONTACT
   * -------------------------------------------------------
   */

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsPhoneNumber()
  alternatePhone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  /**
   * -------------------------------------------------------
   * ADDRESS
   * -------------------------------------------------------
   */

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  address: CompanyAddress;

  /**
   * -------------------------------------------------------
   * CONTACT PERSON
   * -------------------------------------------------------
   */

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  contact: CompanyContact;

  /**
   * -------------------------------------------------------
   * BRANDING
   * -------------------------------------------------------
   */

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  branding?: CompanyBranding;

  /**
   * -------------------------------------------------------
   * SUBSCRIPTION
   * -------------------------------------------------------
   */

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  subscription: SubscriptionDetails;

  /**
   * -------------------------------------------------------
   * SETTINGS
   * -------------------------------------------------------
   */

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  settings: CompanySettings;

  /**
   * -------------------------------------------------------
   * STORAGE
   * -------------------------------------------------------
   */

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  storage?: StorageUsage;

  /**
   * -------------------------------------------------------
   * MULTI TENANT
   * -------------------------------------------------------
   */

  @IsString()
  tenantId: string;

  /**
   * -------------------------------------------------------
   * VERIFICATION FLAGS
   * -------------------------------------------------------
   */

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  phoneVerified?: boolean;
}