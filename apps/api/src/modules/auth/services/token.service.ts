import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { StringValue } from 'ms';

export interface JwtPayload {
  sub: string;
  companyId: string;
  email: string;
  role: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async generateAccessToken(
    payload: JwtPayload,
  ): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>(
        'auth.jwtAccessSecret',
      ),
      expiresIn: this.config.getOrThrow<StringValue>(
        'auth.jwtAccessExpires',
      ),
    });
  }

  async generateRefreshToken(
    payload: JwtPayload,
  ): Promise<string> {
    return this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>(
        'auth.jwtRefreshSecret',
      ),
      expiresIn: this.config.getOrThrow<StringValue>(
        'auth.jwtRefreshExpires',
      ),
    });
  }

  async verifyAccessToken(
    token: string,
  ): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(
        token,
        {
          secret:
            this.config.getOrThrow<string>(
              'auth.jwtAccessSecret',
            ),
        },
      );
    } catch {
      throw new UnauthorizedException(
        'Invalid access token',
      );
    }
  }

  async verifyRefreshToken(
    token: string,
  ): Promise<JwtPayload> {
    try {
      return await this.jwt.verifyAsync<JwtPayload>(
        token,
        {
          secret:
            this.config.getOrThrow<string>(
              'auth.jwtRefreshSecret',
            ),
        },
      );
    } catch {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }
  }
}