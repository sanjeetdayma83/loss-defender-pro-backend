import { ApiProperty } from '@nestjs/swagger';

export class WarehouseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    nullable: true,
  })
  address: string | null;

  @ApiProperty({
    nullable: true,
  })
  city: string | null;

  @ApiProperty({
    nullable: true,
  })
  state: string | null;

  @ApiProperty({
    nullable: true,
  })
  country: string | null;

  @ApiProperty({
    nullable: true,
  })
  pincode: string | null;

  @ApiProperty({
    nullable: true,
  })
  phone: string | null;

  @ApiProperty({
    nullable: true,
  })
  email: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
