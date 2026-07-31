import { User } from '@prisma/client';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';

export interface IUserService {
  create(dto: CreateUserDto): Promise<User>;

  update(id: string, dto: UpdateUserDto): Promise<User>;

  remove(id: string): Promise<User>;

  restore(id: string): Promise<User>;

  findById(id: string): Promise<User>;

  findAll(query: UserQueryDto): Promise<any>;

  activate(id: string): Promise<User>;

  deactivate(id: string): Promise<User>;

  healthCheck(): Promise<boolean>;
}
