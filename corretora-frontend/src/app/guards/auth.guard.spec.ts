import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';
describe('authGuard', () => {
  it('permite usuario autenticado', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: { isLoggedIn: () => true } },
      { provide: Router, useValue: { parseUrl: () => 'login' } },
    ] });
    expect(TestBed.runInInjectionContext(() => authGuard())).toBe(true);
  });
  it('redireciona usuario sem sessao para login', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: { isLoggedIn: () => false } },
      { provide: Router, useValue: { parseUrl: (url: string) => url } },
    ] });
    expect(TestBed.runInInjectionContext(() => authGuard())).toBe('/login');
  });
});
