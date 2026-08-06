import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Enforces that every authenticated request carries a companyId claim.
// This does NOT filter your Prisma queries for you — every service method
// still MUST pass `where: { companyId: user.companyId, ... }` explicitly.
// This guard is a safety net that rejects tokens with a missing/malformed claim.
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.companyId) {
      throw new UnauthorizedException('Missing tenant context on token');
    }
    return true;
  }
}
