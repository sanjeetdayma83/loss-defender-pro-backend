export interface WarehouseEntity {
  id: string;

  companyId: string;

  code: string;

  name: string;

  description: string | null;

  address: string | null;

  city: string | null;

  state: string | null;

  country: string | null;

  pincode: string | null;

  phone: string | null;

  email: string | null;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date | null;

  isDeleted: boolean;
}