import { Exclude } from 'class-transformer';
import { User } from '@prisma/client';

export class UserEntity implements User {
  id: string;
  companyId: string;

  firstName: string;
  lastName: string;

  email: string;
  username: string | null;
  employeeCode: string | null;

  role: any;
  status: any;

  @Exclude()
  passwordHash: string;

  @Exclude()
  refreshTokenHash: string | null;

  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;

  profile: any;
  assignment: any;
  permissions: any;
  statistics: any;

  emailVerified: boolean;
  phoneVerified: boolean;
  twoFactorEnabled: boolean;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  isDeleted: boolean;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}