import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Ensures every authenticated request has a valid companyId (tenant).
 * Attaches request.tenantId for downstream services.
 * Super-admin can optionally pass X-Tenant-Id to act on another company.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Not authenticated');
    }

    // JWT must carry companyId (set in auth strategy)
    let companyId: string | undefined = user.companyId;

    // Super-admin impersonation / cross-tenant support
    if (user.role === 'super_admin') {
      const headerTenant = request.headers['x-tenant-id'] as string | undefined;
      if (headerTenant) companyId = headerTenant;
    }

    if (!companyId) {
      throw new ForbiddenException('Tenant context missing — companyId required');
    }

    request.tenantId = companyId;
    request.user = { ...user, companyId };
    return true;
  }
}
