import { Module } from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import { UsersController } from './controllers/users.controller';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './services/user.service';

@Module({
  controllers: [UsersController],
  providers: [PrismaService, UserRepository, UserService],
  exports: [UserRepository, UserService],
})
export class UsersModule {}
