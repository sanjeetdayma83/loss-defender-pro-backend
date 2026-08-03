import { IsString } from 'class-validator';

export class UserPermissionDto {
  @IsString()
  permission: string;
}