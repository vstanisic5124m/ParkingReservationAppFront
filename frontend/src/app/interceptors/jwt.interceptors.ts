import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Only attach the Authorization header for our API domain
        const token = this.authService.getToken();
        const isApiUrl = request.url.startsWith('http://localhost:8080/api');

        if (token && isApiUrl) {
            // Use prefix from currentUser if available (response.type), fallback to 'Bearer'
            const prefix = (this.authService.currentUserValue && (this.authService.currentUserValue as any).type) || 'Bearer';
            console.debug('[JwtInterceptor] Attaching Authorization header to request', request.url);
            request = request.clone({
                setHeaders: {
                    Authorization: `${prefix} ${token}`
                }
            });
        } else if (!isApiUrl) {
            // outside API calls - skip
            // console.debug('[JwtInterceptor] Skipping Authorization for non-API request', request.url);
        } else if (!token && isApiUrl) {
            console.warn('[JwtInterceptor] No token present while sending request to API', request.url);
        }

        return next.handle(request);
    }
}