import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';

import { UserRepository } from '../../user/repositories/user.repository';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.users.findByEmailActive(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await this.passwordService.verify(
      user.passwordHash,
      dto.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        `User account is ${user.status.toLowerCase()}`,
      );
    }

    return this.issueTokens(user);
  }

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.users.findById(userId);

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<LoginResponseDto> {
    const payload = await this.tokenService.verifyRefreshToken(
      dto.refreshToken,
    );

    const user = await this.users.findById(payload.sub);

    if (!user || user.isDeleted || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const valid = await this.passwordService.verify(
      user.refreshTokenHash,
      dto.refreshToken,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    const user = await this.users.findById(userId);

    if (!user || user.isDeleted) {
      throw new UnauthorizedException('User not found');
    }

    await this.users.updateRefreshToken(userId, null);
  }

  private async issueTokens(user: {
    id: string;
    companyId: string;
    email: string;
    role: string;
    status: UserStatus;
  }): Promise<LoginResponseDto> {
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException(
        `User account is ${user.status.toLowerCase()}`,
      );
    }

    const payload = {
      sub: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);

    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    const refreshTokenHash = await this.passwordService.hash(refreshToken);

    await this.users.updateRefreshToken(user.id, refreshTokenHash);

    await this.users.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: '15m',
      tokenType: 'Bearer',
    };
  }
}
