import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserRole } from '@prisma/client';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LoginDto } from '../dto/login.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user',
  })
  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDto,
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.COMPANY_ADMIN,
    UserRole.WAREHOUSE_MANAGER,
    UserRole.SUPERVISOR,
    UserRole.OPERATOR,
    UserRole.VIEWER,
  )
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get authenticated user profile',
  })
  @ApiOkResponse({
    type: ProfileResponseDto,
  })
  async getProfile(
    @CurrentUser()
    user: {
      id: string;
    },
  ): Promise<ProfileResponseDto> {
    return this.authService.getProfile(user.id);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiOkResponse({
    description: 'New access and refresh tokens issued',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refresh(
    @Body()
    dto: RefreshTokenDto,
  ): Promise<LoginResponseDto> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout authenticated user',
  })
  @ApiOkResponse({
    description: 'Logout successful',
  })
  async logout(
    @CurrentUser()
    user: {
      id: string;
    },
  ): Promise<{
    message: string;
  }> {
    await this.authService.logout(user.id);

    return {
      message: 'Logout successful',
    };
  }
}
