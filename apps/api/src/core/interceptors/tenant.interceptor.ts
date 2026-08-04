import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Secure Tenant Isolation: Automatically inject companyId from JWT to prevent data leaks
    if (user && user.companyId) {
      if (request.method === 'GET') {
        request.query = { ...request.query, companyId: user.companyId };
      } else if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
        request.body = { ...request.body, companyId: user.companyId };
      }
    }
    return next.handle();
  }
}
