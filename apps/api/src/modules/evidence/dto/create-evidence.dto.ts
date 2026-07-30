import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  EvidenceStatus,
} from '@prisma/client';
import {
  IsEnum,
  IsJSON,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEvidenceDto {
  @ApiProperty({
    description: 'Company ID',
  })
  @IsUUID()
  companyId!: string;

  @ApiProperty({
    description: 'Warehouse ID',
  })
  @IsUUID()
  warehouseId!: string;

  @ApiProperty({
    description: 'Order ID',
  })
  @IsUUID()
  orderId!: string;

  @ApiProperty({
    description: 'Recording ID',
  })
  @IsUUID()
  recordingId!: string;

  @ApiPropertyOptional({
    enum: EvidenceStatus,
    default: EvidenceStatus.CREATED,
  })
  @IsOptional()
  @IsEnum(EvidenceStatus)
  status?: EvidenceStatus =
    EvidenceStatus.CREATED;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsJSON()
  metadata?: string;

  @ApiPropertyOptional({
    description: 'Evidence remarks',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}