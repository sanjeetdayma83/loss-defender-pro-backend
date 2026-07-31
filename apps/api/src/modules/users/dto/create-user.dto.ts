import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import type {
  UserAssignment,
  UserPermission,
  UserProfile,
} from '../types/user.types';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  role: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  profile: UserProfile;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  assignment: UserAssignment;

  @IsArray()
  permissions: UserPermission[];

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  phoneVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;
}
