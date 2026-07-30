import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WarehouseRepository } from '../repositories/warehouse.repository';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { WarehouseQueryDto } from '../dto/warehouse-query.dto';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly warehouseRepository: WarehouseRepository,
  ) {}

  async create(companyId: string, dto: CreateWarehouseDto) {
    const exists = await this.warehouseRepository.exists(
      companyId,
      dto.code,
    );

    if (exists) {
      throw new BadRequestException(
        'Warehouse code already exists.',
      );
    }

    return this.warehouseRepository.create({
      ...dto,
      company: {
        connect: {
          id: companyId,
        },
      },
    });
  }

  async findAll(companyId: string, query: WarehouseQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive,
    } = query;

    const where: any = {
      companyId,
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          code: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.warehouseRepository.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.warehouseRepository.count(where),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const warehouse =
      await this.warehouseRepository.findById(id);

    if (!warehouse) {
      throw new NotFoundException(
        'Warehouse not found.',
      );
    }

    return warehouse;
  }

  async update(
    id: string,
    dto: UpdateWarehouseDto,
  ) {
    await this.findOne(id);

    return this.warehouseRepository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.warehouseRepository.softDelete(id);
  }
}