export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
}

export interface UserAssignment {
  companyId: string;
  warehouseIds: string[];
}

export interface UserPermission {
  module: string;
  actions: string[];
}

export interface UserStatistics {
  totalLogins: number;
  lastLogin?: Date;
  ordersProcessed: number;
  scansCompleted: number;
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: string;
  companyId?: string;
  warehouseId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
