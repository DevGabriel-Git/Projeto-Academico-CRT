import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  function setup(loggedIn: boolean, profile = 'USER', status?: number) {
    const logout = vi.fn();
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: {
        isLoggedIn: () => loggedIn, logout,
        currentUser: () => status ? throwError(() => ({ status })) : of({ perfil: profile })
      } },
      { provide: Router, useValue: { parseUrl: (url: string) => url } }
    ] });
    return logout;
  }

  it('exige login antes de consultar administracao', async () => {
    setup(false);
    expect(await firstValueFrom(TestBed.runInInjectionContext(() => adminGuard()))).toBe('/login');
  });
  it('permite administrador confirmado pela API', async () => {
    setup(true, 'ADMIN');
    expect(await firstValueFrom(TestBed.runInInjectionContext(() => adminGuard()))).toBe(true);
  });
  it('nega usuario comum mesmo com perfil local adulterado', async () => {
    localStorage.setItem('user', JSON.stringify({ perfil: 'ADMIN' }));
    setup(true, 'USER');
    expect(await firstValueFrom(TestBed.runInInjectionContext(() => adminGuard()))).toBe('/dashboard');
    localStorage.clear();
  });
  it('encerra sessao expirada', async () => {
    const logout = setup(true, 'ADMIN', 401);
    expect(await firstValueFrom(TestBed.runInInjectionContext(() => adminGuard()))).toBe('/login');
    expect(logout).toHaveBeenCalledOnce();
  });
  it('nega administracao se a confirmacao falhar', async () => {
    const logout = setup(true, 'ADMIN', 503);
    expect(await firstValueFrom(TestBed.runInInjectionContext(() => adminGuard()))).toBe('/dashboard');
    expect(logout).not.toHaveBeenCalled();
  });
});
