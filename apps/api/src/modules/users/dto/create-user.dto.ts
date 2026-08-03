import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import { UserAssignmentDto } from './user-assignment.dto';
import { UserPermissionDto } from './user-permission.dto';
import { UserProfileDto } from './user-profile.dto';

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
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  role: string;

  @ValidateNested()
  @Type(() => UserProfileDto)
  profile: UserProfileDto;

  @ValidateNested()
  @Type(() => UserAssignmentDto)
  assignment: UserAssignmentDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionDto)
  permissions: UserPermissionDto[];

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