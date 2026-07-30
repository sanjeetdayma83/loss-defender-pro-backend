import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Permission } from '../constants/permissions';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface AuthenticatedUser {
  id: string;
  role: string;
  permissions?: Permission[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<Permission[]>(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (
      !requiredPermissions ||
      requiredPermissions.length === 0
    ) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest<{
        user?: AuthenticatedUser;
      }>();

    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Authentication required',
      );
    }

    const userPermissions =
      user.permissions ?? [];

    const hasPermission =
      requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions',
      );
    }

    return true;
  }
}