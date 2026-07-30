import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { ScannerController } from './controllers/scanner.controller';
import { ScannerRepository } from './repositories/scanner.repository';
import { ScannerService } from './services/scanner.service';

@Module({
  controllers: [ScannerController],
  providers: [
    PrismaService,
    ScannerRepository,
    ScannerService,
  ],
  exports: [
    ScannerRepository,
    ScannerService,
  ],
})
export class ScannerModule {}