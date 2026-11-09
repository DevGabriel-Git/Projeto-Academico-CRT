import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';
describe('authInterceptor', () => {
  for (const token of [null, 'test-token']) {
    it(token ? 'envia bearer da sessao' : 'preserva requisicao sem token', () => {
      TestBed.configureTestingModule({ providers: [
        { provide: AuthService, useValue: { getToken: () => token } },
        { provide: Router, useValue: { navigate: vi.fn() } },
      ] });
      let actual: HttpRequest<unknown> | undefined;
      const original = new HttpRequest('GET', '/api/carteira');
      TestBed.runInInjectionContext(() => authInterceptor(original, req => {
        actual = req; return of(new HttpResponse({ status: 200 }));
      }));
      expect(actual!.headers.get('Authorization')).toBe(token ? 'Bearer test-token' : null);
      if (!token) expect(actual).toBe(original);
    });
  }
  for (const url of ['/api/auth/login', '/api/auth/register', 'https://example.invalid/data', '/api-other/carteira']) {
    it(`nao envia token antigo ou externo para ${url}`, () => {
      TestBed.configureTestingModule({ providers: [
        { provide: AuthService, useValue: { getToken: () => 'expired-token' } },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ] });
      let actual: HttpRequest<unknown> | undefined;
      TestBed.runInInjectionContext(() => authInterceptor(new HttpRequest('GET', url), req => {
        actual = req;
        return of(new HttpResponse({ status: 200 }));
      }));
      expect(actual!.headers.has('Authorization')).toBe(false);
    });
  }
  for (const [url, status, expires] of [['/api/admin/usuarios', 401, true], ['/api/auth/login', 401, false], ['/api/admin/usuarios', 503, false]] as const) {
    it(`trata resposta ${status} em ${url}`, () => {
      const logout = vi.fn();
      const navigate = vi.fn();
      TestBed.configureTestingModule({ providers: [
        { provide: AuthService, useValue: { getToken: () => 'expired-token', logout } },
        { provide: Router, useValue: { navigate } }
      ] });
      let actualError: unknown;
      TestBed.runInInjectionContext(() => authInterceptor(new HttpRequest('GET', url), () => throwError(() => ({ status }))))
        .subscribe({ error: error => actualError = error });
      expect(actualError).toEqual({ status });
      expect(logout).toHaveBeenCalledTimes(expires ? 1 : 0);
      if (expires) expect(navigate).toHaveBeenCalledWith(['/login'], { queryParams: { reason: 'expired' } });
      else expect(navigate).not.toHaveBeenCalled();
    });
  }
});
