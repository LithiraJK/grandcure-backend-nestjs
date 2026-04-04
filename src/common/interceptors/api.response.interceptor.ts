import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T | null;
};

// Interceptor to standardize API responses across the application.
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<unknown> | unknown> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data: any) => {
        // If the controller already returns a properly formatted response, pass it through.
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'message' in data &&
          'data' in data
        ) {
          return data;
        }

        return {
          statusCode: response.statusCode,
          message: typeof data?.message === 'string' ? data.message : 'Operation successful',
          data: data?.result ?? data ?? null,
        };
      }),
    );
  }
}