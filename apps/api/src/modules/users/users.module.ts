import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';

import { PrismaService } from '../../database/prisma.service';

import { UsersController } from './controllers/users.controller';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [PrismaService, UserRepository, UserService],
  exports: [UserRepository, UserService],
})
export class UsersModule {}

