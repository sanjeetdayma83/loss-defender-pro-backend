import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { CompanyController } from './controllers/company/company.controller';
import { CompanyRepository } from './repositories/company.repository';
import { CompanyService } from './services/company/company.service';

@Module({
  imports: [AuthModule],
  controllers: [CompanyController],

  providers: [CompanyService, CompanyRepository],

  exports: [CompanyService, CompanyRepository],
})
export class CompanyModule {}

