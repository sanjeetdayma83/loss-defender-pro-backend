import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class WarehouseLocationDto {
  @ApiProperty()
  @IsNumber()
  latitude: number;

  @ApiProperty()
  @IsNumber()
  longitude: number;
}