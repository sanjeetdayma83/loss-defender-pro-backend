import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const SENSITIVE_FIELDS = new Set([
  'passwordHash',
  'refreshTokenHash',
  'apiKey',
  'secretKey',
]);

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: unknown) => ({
        success: true,
        requestId: request.headers['x-request-id'],
        timestamp: new Date().toISOString(),
        path: request.originalUrl,
        method: request.method,
        data: this.sanitize(data),
      })),
    );
  }

  private sanitize(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (value instanceof Date) {
    return value;
    }

    if (typeof value !== 'object') {
      return value;
    }

    const result: Record<string, any> = {};

    for (const [key, val] of Object.entries(value)) {
      // Remove sensitive fields globally
      if (SENSITIVE_FIELDS.has(key)) {
  continue;
}

      result[key] = this.sanitize(val);
    }

    return result;
  }
}