import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class EvidenceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  list(companyId: string) {
    return this.prisma.evidence.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getOne(companyId: string, id: string) {
    const row = await this.prisma.evidence.findFirst({ where: { id, companyId } });
    if (!row) throw new NotFoundException('Evidence not found');
    return row;
  }

  async getDownloadUrl(companyId: string, id: string) {
    const row = await this.prisma.evidence.findFirst({ where: { id, companyId } });
    if (!row) throw new NotFoundException('Evidence not found');
    if (!(row as any).packKey) {
      return { configured: false, downloadUrl: null, message: 'No packKey yet' };
    }
    const signed = await this.storage.presignGet((row as any).packKey);
    return {
      ...signed,
      evidenceId: id,
    };
  }
}
