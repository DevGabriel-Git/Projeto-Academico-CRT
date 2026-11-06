import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLoggedIn()) return of(router.parseUrl('/login'));
  return auth.currentUser().pipe(
    map(user => user.perfil === 'ADMIN' ? true : router.parseUrl('/dashboard')),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        return of(router.parseUrl('/login'));
      }
      return of(router.parseUrl('/dashboard'));
    })
  );
};
