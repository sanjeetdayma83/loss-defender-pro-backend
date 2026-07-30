import {
  UserAssignment,
  UserPermission,
  UserProfile,
  UserStatistics,
} from '../types/user.types';

export class UserResponseDto {
  id: string;

  companyId: string;

  employeeCode: string;

  email: string;

  username: string;

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

  createdAt: Date;

  updatedAt: Date;
}