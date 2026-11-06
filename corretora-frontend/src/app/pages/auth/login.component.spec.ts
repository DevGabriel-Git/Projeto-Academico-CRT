import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
import { environment } from '../../../environments/environment';

describe('Login por perfil', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [LoginComponent], providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])] });
  });
  afterEach(() => { TestBed.inject(HttpTestingController).verify(); localStorage.clear(); });

  for (const [perfil, destination] of [['ADMIN', '/admin'], ['USER', '/dashboard']]) {
    it(`direciona ${perfil} para sua area`, () => {
      const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      const fixture = TestBed.createComponent(LoginComponent);
      fixture.componentInstance.credentials = { login: 'teste@example.invalid', senha: 'senha-de-laboratorio' };
      fixture.componentInstance.onSubmit();
      TestBed.inject(HttpTestingController).expectOne(environment.apiUrl + '/auth/login').flush({ token: 'fixture-token', perfil });
      expect(navigate).toHaveBeenCalledWith([destination]);
    });
  }
});
