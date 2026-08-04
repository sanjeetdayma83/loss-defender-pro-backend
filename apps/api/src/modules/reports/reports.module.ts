import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../../database/prisma.service';
import { ReportsController } from './controllers/reports.controller';
import { ReportsRepository } from './repositories/reports.repository';
import { ReportsService } from './services/reports.service';

@Module({
  imports: [AuthModule],
  controllers: [ReportsController],
  providers: [PrismaService, ReportsRepository, ReportsService],
  exports: [ReportsRepository, ReportsService],
})
export class ReportsModule {}

