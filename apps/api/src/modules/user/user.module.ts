import { Module, forwardRef } from '@nestjs/common';

import { PrismaModule } from '../../database/prisma.module';

import { AuthModule } from '../auth/auth.module';

import { UserController } from './controllers/user/user.controller';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user/user.service';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
  ],

  controllers: [UserController],

  providers: [
    UserService,
    UserRepository,
  ],

  exports: [
    UserRepository,
  ],
})
export class UserModule {}