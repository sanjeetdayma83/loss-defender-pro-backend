import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user?.role) {
      throw new ForbiddenException('Missing role');
    }

    // super_admin bypass
    if (user.role === Role.super_admin) return true;

    const ok = required.includes(user.role as Role);
    if (!ok) {
      throw new ForbiddenException(
        `Requires one of: ${required.join(', ')}`,
      );
    }
    return true;
  }
}
