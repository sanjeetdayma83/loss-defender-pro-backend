import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateRecordingDto {
  @ApiProperty({
    example: '2b9f4f36-4d2b-41e6-b97d-1c41dc9c0b12',
    description: 'Company ID',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;

  @ApiProperty({
    example: '0f7d4f8d-39d3-46f3-b1af-83949b65c4d7',
    description: 'Warehouse ID',
  })
  @IsUUID()
  @IsNotEmpty()
  warehouseId: string;

  @ApiProperty({
    example: '89bc60dd-76a4-4bc5-a861-b67b25c2d785',
    description: 'Order ID',
  })
  @IsUUID()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({
    example: 'e0d70d11-c5b4-4d0d-a01d-9f03bfc7d8af',
    description: 'Operator ID',
  })
  @IsUUID()
  @IsNotEmpty()
  operatorId: string;

  @ApiProperty({
    required: false,
    example: 'packing_video.mp4',
    description: 'Original uploaded filename',
  })
  @IsOptional()
  @IsString()
  originalFileName?: string;

  @ApiProperty({
    required: false,
    example: 'warehouse-cam-01.mp4',
    description: 'Local filename stored on device',
  })
  @IsOptional()
  @IsString()
  localFileName?: string;
}