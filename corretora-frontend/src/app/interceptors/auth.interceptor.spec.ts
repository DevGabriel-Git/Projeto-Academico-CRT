import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { authInterceptor } from './auth.interceptor';
describe('authInterceptor', () => {
  for (const token of [null, 'test-token']) {
    it(token ? 'envia bearer da sessao' : 'preserva requisicao sem token', () => {
      TestBed.configureTestingModule({ providers: [
        { provide: AuthService, useValue: { getToken: () => token } },
      ] });
      let actual: HttpRequest<unknown> | undefined;
      const original = new HttpRequest('GET', '/carteira');
      TestBed.runInInjectionContext(() => authInterceptor(original, req => {
        actual = req; return of(new HttpResponse({ status: 200 }));
      }));
      expect(actual!.headers.get('Authorization')).toBe(token ? 'Bearer test-token' : null);
      if (!token) expect(actual).toBe(original);
    });
  }
});
