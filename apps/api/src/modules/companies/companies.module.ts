import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { CompaniesController } from './controllers/companies.controller';

import { CompanyService } from './services/company.service';

import { CompanyRepository } from './repositories/company.repository';

@Module({
  controllers: [
    CompaniesController,
  ],

  providers: [
    PrismaService,
    CompanyRepository,
    CompanyService,
  ],

  exports: [
    CompanyRepository,
    CompanyService,
  ],
})
export class CompaniesModule {}