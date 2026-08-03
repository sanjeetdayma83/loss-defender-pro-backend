import { ApiProperty } from '@nestjs/swagger';

export class UserPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyId: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  username: string | null;

  @ApiProperty({ nullable: true })
  employeeCode: string | null;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ nullable: true })
  profile: unknown;

  @ApiProperty({ nullable: true })
  assignment: unknown;

  @ApiProperty({ nullable: true })
  permissions: unknown;

  @ApiProperty({ nullable: true })
  statistics: unknown;

  @ApiProperty()
  emailVerified: boolean;

  @ApiProperty()
  phoneVerified: boolean;

  @ApiProperty()
  twoFactorEnabled: boolean;

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty({ nullable: true })
  passwordChangedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  deletedAt: Date | null;

  @ApiProperty()
  isDeleted: boolean;
}