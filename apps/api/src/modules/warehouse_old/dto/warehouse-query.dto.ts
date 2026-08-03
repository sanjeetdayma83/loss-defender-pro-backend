import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class WarehouseQueryDto {
  @ApiPropertyOptional({
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiPropertyOptional({
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 20;

  @ApiPropertyOptional({
    description: 'Search by code or name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    default: 'createdAt',
    enum: ['code', 'name', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsIn(['code', 'name', 'createdAt', 'updatedAt'])
  sortBy: 'code' | 'name' | 'createdAt' | 'updatedAt' = 'createdAt';

  @ApiPropertyOptional({
    default: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional()
  @Transform(({ value }) => {
    if (value === undefined) {
      return undefined;
    }

    return value === 'true';
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
