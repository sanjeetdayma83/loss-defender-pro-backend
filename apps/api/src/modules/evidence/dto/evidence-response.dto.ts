import { ApiProperty } from '@nestjs/swagger';
import { EvidenceStatus } from '@prisma/client';

export class EvidenceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  companyId!: string;

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  recordingId!: string;

  @ApiProperty({
    enum: EvidenceStatus,
  })
  status!: EvidenceStatus;

  @ApiProperty({
    nullable: true,
  })
  originalVideoUrl!: string | null;

  @ApiProperty({
    nullable: true,
  })
  processedVideoUrl!: string | null;

  @ApiProperty({
    nullable: true,
  })
  thumbnailUrl!: string | null;

  @ApiProperty({
    nullable: true,
  })
  hash!: string | null;

  @ApiProperty({
    nullable: true,
  })
  checksum!: string | null;

  @ApiProperty({
    nullable: true,
  })
  fileSize!: number | null;

  @ApiProperty({
    nullable: true,
  })
  duration!: number | null;

  @ApiProperty({
    nullable: true,
    type: Object,
  })
  metadata!: Record<string, unknown> | null;

  @ApiProperty({
    nullable: true,
  })
  generatedAt!: Date | null;

  @ApiProperty({
    nullable: true,
  })
  verifiedAt!: Date | null;

  @ApiProperty({
    nullable: true,
  })
  archivedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
