import { ApiProperty } from '@nestjs/swagger';
import { RecordingStatus } from '@prisma/client';

export class RecordingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  warehouseId: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  operatorId: string;

  @ApiProperty({
    enum: RecordingStatus,
  })
  status: RecordingStatus;

  @ApiProperty({
    nullable: true,
  })
  startedAt: Date | null;

  @ApiProperty({
    nullable: true,
  })
  pausedAt: Date | null;

  @ApiProperty({
    nullable: true,
  })
  resumedAt: Date | null;

  @ApiProperty({
    nullable: true,
  })
  stoppedAt: Date | null;

  @ApiProperty()
  durationSeconds: number;

  @ApiProperty({
    nullable: true,
  })
  localFileName: string | null;

  @ApiProperty({
    nullable: true,
  })
  originalFileName: string | null;

  @ApiProperty({
    nullable: true,
  })
  fileUrl: string | null;

  @ApiProperty({
    nullable: true,
  })
  thumbnailUrl: string | null;

  @ApiProperty({
    nullable: true,
    type: String,
    description: 'File size in bytes',
  })
  fileSize: bigint | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}