import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CompanyStatusDto {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export class CreateCompanyDto {
  @ApiProperty({
    example: 'LDP001',
  })
  @IsString()
  @Length(2, 30)
  code!: string;

  @ApiProperty({
    example: 'PrimeCore Enterprises',
  })
  @IsString()
  @Length(2, 150)
  name!: string;

  @ApiPropertyOptional({
    example: 'contact@primecore.in',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+91-9876543210',
  })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  phone?: string;

  @ApiPropertyOptional({
    enum: CompanyStatusDto,
    default: CompanyStatusDto.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CompanyStatusDto)
  status?: CompanyStatusDto;
}