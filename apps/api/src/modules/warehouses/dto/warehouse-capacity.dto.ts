import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class WarehouseCapacityDto {
  @ApiProperty()
  @IsNumber()
  totalAreaSqFt: number;

  @ApiProperty()
  @IsNumber()
  usedAreaSqFt: number;

  @ApiProperty()
  @IsNumber()
  totalRacks: number;

  @ApiProperty()
  @IsNumber()
  totalBins: number;

  @ApiProperty()
  @IsNumber()
  totalZones: number;

  @ApiProperty()
  @IsNumber()
  utilizationPercentage: number;
}