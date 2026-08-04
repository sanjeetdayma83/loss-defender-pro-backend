import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Secure Tenant Isolation — never re-assign request.query (Express getter-only)
    if (user?.companyId) {
      // Attach on request for services/repositories to read
      request.companyId = user.companyId;

      if (request.method === 'GET') {
        // Mutate existing query object instead of re-assigning
        Object.assign(request.query || {}, { companyId: user.companyId });
      } else if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        if (!request.body) request.body = {};
        request.body.companyId = user.companyId;
      }
    }

    return next.handle();
  }
}
