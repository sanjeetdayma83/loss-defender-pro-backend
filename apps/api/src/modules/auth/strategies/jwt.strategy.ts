import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserRepository } from '../../users/repositories/user.repository';
import { ROLE_PERMISSIONS } from '../constants/role-permissions';
import { JwtPayload } from '../services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: config.getOrThrow<string>('auth.jwtAccessSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.users.findById(payload.sub);

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role] ?? [],
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
