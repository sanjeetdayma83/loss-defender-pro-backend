import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { User } from '@prisma/client';

import { UserRepository } from '../repositories/user.repository';

import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';

import { IUserService } from '../interfaces/user.interface';

@Injectable()
export class UserService
  implements IUserService
{
  constructor(
    private readonly repository: UserRepository,
  ) {}

  /**
   * -------------------------------------------------------
   * CREATE
   * -------------------------------------------------------
   */

  async create(
    dto: CreateUserDto,
  ): Promise<User> {
    if (
      await this.repository.existsByEmail(
        dto.email,
      )
    ) {
      throw new ConflictException(
        'Email already exists.',
      );
    }

    if (
      await this.repository.existsByUsername(
        dto.username,
      )
    ) {
      throw new ConflictException(
        'Username already exists.',
      );
    }

    if (
      await this.repository.existsByEmployeeCode(
        dto.employeeCode,
      )
    ) {
      throw new ConflictException(
        'Employee code already exists.',
      );
    }

    return this.repository.create(dto);
  }

  /**
   * -------------------------------------------------------
   * READ
   * -------------------------------------------------------
   */

  async findAll(
    query: UserQueryDto,
  ) {
    return this.repository.findAll(query);
  }

  async findById(
    id: string,
  ): Promise<User> {
    return this.repository.findById(id);
  }

  async findByEmail(
    email: string,
  ) {
    return this.repository.findByEmail(
      email,
    );
  }

  async findByUsername(
    username: string,
  ) {
    return this.repository.findByUsername(
      username,
    );
  }

  async findByEmployeeCode(
    employeeCode: string,
  ) {
    return this.repository.findByEmployeeCode(
      employeeCode,
    );
  }

  async findByCompany(
    companyId: string,
  ) {
    return this.repository.findByCompany(
      companyId,
    );
  }

  async findByWarehouse(
    warehouseId: string,
  ) {
    return this.repository.findByWarehouse(
      warehouseId,
    );
  }

  /**
   * -------------------------------------------------------
   * UPDATE
   * -------------------------------------------------------
   */

  async update(
    id: string,
    dto: UpdateUserDto,
  ): Promise<User> {
    return this.repository.update(
      id,
      dto,
    );
  }

  /**
   * -------------------------------------------------------
   * DELETE
   * -------------------------------------------------------
   */

  async remove(
    id: string,
  ): Promise<User> {
    return this.repository.softDelete(
      id,
    );
  }

  async restore(
    id: string,
  ): Promise<User> {
    return this.repository.restore(id);
  }

  /**
   * -------------------------------------------------------
   * STATUS
   * -------------------------------------------------------
   */

  async activate(
    id: string,
  ): Promise<User> {
    return this.repository.activate(id);
  }

  async deactivate(
    id: string,
  ): Promise<User> {
    return this.repository.deactivate(id);
  }

  /**
   * -------------------------------------------------------
   * LOGIN
   * -------------------------------------------------------
   */

  async updateLastLogin(
    id: string,
  ) {
    return this.repository.updateLastLogin(
      id,
    );
  }

  async updatePassword(
    id: string,
    password: string,
  ) {
    return this.repository.updatePassword(
      id,
      password,
    );
  }

  /**
   * -------------------------------------------------------
   * STATISTICS
   * -------------------------------------------------------
   */

  async getStatistics(
    id: string,
  ) {
    return this.repository.getStatistics(
      id,
    );
  }
    /**
   * -------------------------------------------------------
   * BULK OPERATIONS
   * -------------------------------------------------------
   */

  async bulkActivate(
    ids: string[],
  ) {
    return this.repository.bulkActivate(ids);
  }

  async bulkDeactivate(
    ids: string[],
  ) {
    return this.repository.bulkDeactivate(ids);
  }

  async bulkDelete(
    ids: string[],
  ) {
    return this.repository.bulkDelete(ids);
  }

  /**
   * -------------------------------------------------------
   * VALIDATION
   * -------------------------------------------------------
   */

  async emailExists(
    email: string,
  ): Promise<boolean> {
    return this.repository.existsByEmail(email);
  }

  async usernameExists(
    username: string,
  ): Promise<boolean> {
    return this.repository.existsByUsername(
      username,
    );
  }

  async employeeCodeExists(
    employeeCode: string,
  ): Promise<boolean> {
    return this.repository.existsByEmployeeCode(
      employeeCode,
    );
  }

  /**
   * -------------------------------------------------------
   * HEALTH
   * -------------------------------------------------------
   */

  async healthCheck(): Promise<boolean> {
    return this.repository.healthCheck();
  }

  async ping() {
    return this.repository.ping();
  }

  /**
   * -------------------------------------------------------
   * GENERIC HELPERS
   * -------------------------------------------------------
   */

  count() {
    return this.repository.count();
  }

  async getRepository() {
    return this.repository;
  }

  async metadata() {
    return {
      module: 'Users',
      service: 'UserService',
      version: '1.0.0',
      healthy: await this.healthCheck(),
      timestamp: new Date(),
    };
  }
}