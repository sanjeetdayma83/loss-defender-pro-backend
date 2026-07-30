export interface WarehouseAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface WarehouseLocation {
  latitude: number;
  longitude: number;
}

export interface WarehouseManager {
  userId: string;
  name: string;
  email: string;
  phone: string;
}

export interface WarehouseCapacity {
  totalAreaSqFt: number;
  usedAreaSqFt: number;
  totalRacks: number;
  totalBins: number;
  totalZones: number;
  utilizationPercentage: number;
}

export interface WarehouseStatistics {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalWorkers: number;
  totalScanners: number;
}

export interface WarehouseDashboard {
  capacity: WarehouseCapacity;
  statistics: WarehouseStatistics;
}

export interface WarehouseFilter {
  search?: string;
  companyId?: string;
  status?: string;
  type?: string;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}