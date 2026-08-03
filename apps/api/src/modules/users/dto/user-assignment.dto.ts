import {
  IsArray,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserAssignmentDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  warehouseIds?: string[];

  @IsOptional()
  @IsString()
  primaryWarehouseId?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  reportingManager?: string;
}