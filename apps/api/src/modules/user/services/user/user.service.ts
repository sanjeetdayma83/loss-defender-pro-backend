import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PasswordService } from '../../../auth/services/password.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UpdateUserDto } from '../../dto/update-user.dto';
import { UserRepository } from '../../repositories/user.repository';
import { UserResponse } from '../../responses/user.response';

@Injectable()
export class UserService {
  constructor(
    private readonly repository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponse> {
    const existing = await this.repository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.repository.create({
      companyId: dto.companyId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
    });

    return new UserResponse(user);
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.repository.findAll();

    return users.map((user) => new UserResponse(user));
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return new UserResponse(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const updateData: Record<string, unknown> = {
      ...dto,
    };

    if (dto.password) {
      updateData.passwordHash = await this.passwordService.hash(dto.password);

      delete updateData.password;
    }

    const user = await this.repository.update(id, updateData);

    return new UserResponse(user);
  }

  async remove(id: string): Promise<UserResponse> {
    const user = await this.repository.softDelete(id);

    return new UserResponse(user);
  }
}
