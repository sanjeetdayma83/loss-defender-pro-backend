import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { InviteUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'crypto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly config: ConfigService,
  ) {}

  list(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId, status: { not: 'deleted' } },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        warehouseId: true,
        profilePhoto: true,
        joiningDate: true,
        lastLoginAt: true,
        createdAt: true,
        warehouse: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(companyId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId, status: { not: 'deleted' } },
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        warehouseId: true,
        profilePhoto: true,
        joiningDate: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        warehouse: { select: { id: true, name: true, code: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async invite(companyId: string, actorId: string, dto: InviteUserDto, ip?: string) {
    if (dto.role === Role.super_admin) {
      throw new ForbiddenException('Cannot invite super_admin');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    if (dto.warehouseId) {
      const wh = await this.prisma.warehouse.findFirst({
        where: { id: dto.warehouseId, companyId },
      });
      if (!wh) throw new BadRequestException('Warehouse not in your company');
    }

    // Temporary password — user must reset via invite token / forgot-password
    const tempPassword = randomBytes(9).toString('base64url');
    const rounds = this.config.get<number>('security.bcryptRounds') ?? 12;
    const passwordHash = await bcrypt.hash(tempPassword, rounds);

    const user = await this.prisma.user.create({
      data: {
        companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        role: dto.role,
        warehouseId: dto.warehouseId,
        employeeId: dto.employeeId,
        passwordHash,
        status: 'pending',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        warehouseId: true,
        employeeId: true,
        createdAt: true,
      },
    });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    await this.prisma.inviteToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    await this.audit.log({
      companyId,
      actorId,
      action: 'user.invite',
      entity: 'User',
      entityId: user.id,
      after: user as any,
      ipAddress: ip,
    });

    // TODO(P0): enqueue invite email with rawToken link
    return {
      user,
      // Dev only — remove once email worker is live
      inviteToken: rawToken,
      tempPassword,
    };
  }

  async update(
    companyId: string,
    id: string,
    actorId: string,
    dto: UpdateUserDto,
    ip?: string,
  ) {
    const before = await this.prisma.user.findFirst({
      where: { id, companyId, status: { not: 'deleted' } },
    });
    if (!before) throw new NotFoundException('User not found');

    if (dto.role === Role.super_admin) {
      throw new ForbiddenException('Cannot assign super_admin');
    }

    if (dto.warehouseId) {
      const wh = await this.prisma.warehouse.findFirst({
        where: { id: dto.warehouseId, companyId },
      });
      if (!wh) throw new BadRequestException('Warehouse not in your company');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        role: dto.role,
        status: dto.status,
        warehouseId: dto.warehouseId === null ? null : dto.warehouseId,
        employeeId: dto.employeeId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        warehouseId: true,
        employeeId: true,
        updatedAt: true,
      },
    });

    await this.audit.log({
      companyId,
      actorId,
      action: 'user.update',
      entity: 'User',
      entityId: id,
      before: {
        name: before.name,
        role: before.role,
        status: before.status,
        warehouseId: before.warehouseId,
      } as any,
      after: updated as any,
      ipAddress: ip,
    });

    return updated;
  }
}
