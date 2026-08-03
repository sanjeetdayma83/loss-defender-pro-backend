import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UserProfileDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsEmail()
  alternateEmail?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}