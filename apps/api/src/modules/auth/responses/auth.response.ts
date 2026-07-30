import { LoginResponseDto } from '../dto/login-response.dto';

export class AuthResponse implements LoginResponseDto {
  accessToken: string;

  refreshToken: string;

  expiresIn: string;

  tokenType: string;

  constructor(data: LoginResponseDto) {
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.expiresIn = data.expiresIn;
    this.tokenType = data.tokenType;
  }
}