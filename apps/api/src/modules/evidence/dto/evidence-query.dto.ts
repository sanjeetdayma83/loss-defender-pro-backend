import {
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { EvidenceStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EvidenceQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  recordingId?: string;

  @ApiPropertyOptional({
    enum: EvidenceStatus,
  })
  @IsOptional()
  @IsEnum(EvidenceStatus)
  status?: EvidenceStatus;

  @ApiPropertyOptional({
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @ApiPropertyOptional({
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy = 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' =
    'desc';
}