import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES!,
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES!,
}));