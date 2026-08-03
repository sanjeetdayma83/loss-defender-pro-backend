import { User } from '@prisma/client';
import { UserPublicDto } from '../../modules/users/dto/user-public.dto';

export class UserMapper {
  static toPublic(user: User): UserPublicDto {
    const {
      passwordHash,
      refreshTokenHash,
      ...publicUser
    } = user;

    return publicUser as UserPublicDto;
  }

  static toPublicList(users: User[]): UserPublicDto[] {
    return users.map((user) => this.toPublic(user));
  }
}