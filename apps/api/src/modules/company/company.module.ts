import { Module } from '@nestjs/common';

import { CompanyController } from './controllers/company/company.controller';
import { CompanyRepository } from './repositories/company.repository';
import { CompanyService } from './services/company/company.service';

@Module({
  controllers: [CompanyController],

  providers: [CompanyService, CompanyRepository],

  exports: [CompanyService, CompanyRepository],
})
export class CompanyModule {}
