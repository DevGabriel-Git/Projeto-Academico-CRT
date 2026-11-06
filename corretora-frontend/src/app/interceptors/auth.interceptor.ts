import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  const api = environment.apiUrl;
  const isApiRequest = req.url.startsWith(`${api}/`);
  const isPublicLogin = req.url === `${api}/auth/login` || req.url === `${api}/auth/register`;
  const protectedRequest = isApiRequest && !isPublicLogin;
  const outgoing = token && protectedRequest ? req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    }) : req;
  return next(outgoing).pipe(catchError(error => {
    if (protectedRequest && error.status === 401) {
      authService.logout();
      router.navigate(['/login'], { queryParams: { reason: 'expired' } });
    }
    return throwError(() => error);
  }));
};
