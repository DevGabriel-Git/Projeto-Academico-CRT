import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('consulta perfil atual no servidor e atualiza o menu', () => {
    expect(service.isAdmin()).toBe(false);
    service.currentUser().subscribe(user => expect(user.perfil).toBe('ADMIN'));
    http.expectOne(environment.apiUrl + '/auth/me').flush({ id: 1, nome: 'Operador', email: 'op@example.invalid', perfil: 'ADMIN' });
    expect(service.isAdmin()).toBe(true);
    localStorage.setItem('user', JSON.stringify({ perfil: 'USER' }));
    expect(service.isAdmin()).toBe(false);
    localStorage.setItem('user', '{invalid');
    expect(service.isAdmin()).toBe(false);
  });
  it('armazena sessao somente quando o login retorna token', () => {
    service.login({ login: 'aluno', senha: 'teste' }).subscribe();
    http.expectOne(environment.apiUrl + '/auth/login').flush({ token: 'test-token', nome: 'Aluno' });
    expect(service.getToken()).toBe('test-token');
    expect(service.isLoggedIn()).toBe(true);
    expect(JSON.parse(localStorage.getItem('user')!).nome).toBe('Aluno');
    service.logout();
    expect(service.getToken()).toBeNull(); expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('user')).toBeNull();
  });
  it('nao cria sessao quando a resposta de login nao tem token', () => {
    service.login({}).subscribe(); http.expectOne(environment.apiUrl + '/auth/login').flush({});
    expect(service.isLoggedIn()).toBe(false);
  });
  it('armazena sessao apos cadastro autenticado', () => {
    service.register({ nome: 'Aluno' }).subscribe();
    http.expectOne(environment.apiUrl + '/auth/register').flush({ token: 'test-token' });
    expect(service.getToken()).toBe('test-token');
  });
  it('nao cria sessao em cadastro sem token ou login rejeitado', () => {
    service.register({}).subscribe(); http.expectOne(environment.apiUrl + '/auth/register').flush({});
    service.login({}).subscribe({ error: () => {} });
    http.expectOne(environment.apiUrl + '/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(service.isLoggedIn()).toBe(false);
  });
});
