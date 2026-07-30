import {
  UserAssignment,
  UserPermission,
  UserProfile,
  UserStatistics,
} from '../types/user.types';

export class UserEntity {
  id: string;

  companyId: string;

  employeeCode: string;

  email: string;

  username: string;

  password: string;

  role: string;

  status: string;

  profile: UserProfile;

  assignment: UserAssignment;

  permissions: UserPermission[];

  statistics: UserStatistics;

  emailVerified: boolean;

  phoneVerified: boolean;

  twoFactorEnabled: boolean;

  lastLogin?: Date;

  passwordChangedAt?: Date;

  refreshToken?: string;

  isDeleted: boolean;

  createdBy?: string;

  updatedBy?: string;

  deletedBy?: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt?: Date | null;
}