import { ConflictException, Injectable } from '@nestjs/common';

import { CompanyRepository } from '../../repositories/company.repository';

import { CreateCompanyDto } from '../../dto/create-company.dto';
import { UpdateCompanyDto } from '../../dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(private readonly companyRepository: CompanyRepository) {}

  async create(dto: CreateCompanyDto) {
    const existing = await this.companyRepository.findByCode(dto.code);

    if (existing) {
      throw new ConflictException(`Company code '${dto.code}' already exists.`);
    }

    return this.companyRepository.create({
      code: dto.code,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      status: dto.status,
    });
  }

  async findAll() {
    return this.companyRepository.findAll();
  }

  async findOne(id: string) {
    return this.companyRepository.findById(id);
  }

  async update(id: string, dto: UpdateCompanyDto) {
    return this.companyRepository.update(id, dto);
  }

  async remove(id: string) {
    return this.companyRepository.softDelete(id);
  }
}
