import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerService {
  constructor(
    private readonly logger: PinoLogger,
  ) {}

  info(message: string, data?: unknown): void {
    this.logger.info(data, message);
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn(data, message);
  }

  error(message: string, error?: unknown): void {
    this.logger.error(error, message);
  }

  debug(message: string, data?: unknown): void {
    this.logger.debug(data, message);
  }
}