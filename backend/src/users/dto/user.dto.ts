import { IsEmail, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';

export class InviteUserDto {
  @IsString() @MinLength(2) @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsString() @MinLength(8) @MaxLength(20)
  phone: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional() @IsUUID()
  warehouseId?: string;

  @IsOptional() @IsString() @MaxLength(40)
  employeeId?: string;
}

export class UpdateUserDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(120)
  name?: string;

  @IsOptional() @IsString() @MinLength(8) @MaxLength(20)
  phone?: string;

  @IsOptional() @IsEnum(Role)
  role?: Role;

  @IsOptional() @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional() @IsUUID()
  warehouseId?: string | null;

  @IsOptional() @IsString() @MaxLength(40)
  employeeId?: string;
}
