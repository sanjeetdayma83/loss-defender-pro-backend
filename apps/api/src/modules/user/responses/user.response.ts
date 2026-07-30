export class UserResponse {
  id: string;

  companyId: string;

  firstName: string;

  lastName: string;

  email: string;

  role: string;

  status: string;

  lastLoginAt: Date | null;

  createdAt: Date;

  updatedAt: Date;

  constructor(user: {
    id: string;
    companyId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    status: string;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = user.id;
    this.companyId = user.companyId;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;
    this.status = user.status;
    this.lastLoginAt = user.lastLoginAt;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}