import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminComponent } from './admin.component';
import { environment } from '../../../environments/environment';

describe('AdminComponent', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AdminComponent], providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('mostra usuarios e consulta a proxima pagina sem dados sensiveis', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();
    http.expectOne(environment.apiUrl + '/admin/usuarios?page=0&size=20').flush({
      items: [{ id: 1, nome: 'Operador', email: 'op@example.invalid', perfil: 'ADMIN' }],
      page: 0, size: 20, totalElements: 21, totalPages: 2
    });
    expect(fixture.nativeElement.textContent).toContain('Administrador');
    expect(fixture.nativeElement.textContent).toContain('op@example.invalid');
    const buttons = fixture.nativeElement.querySelectorAll('nav button');
    expect(buttons[0].disabled).toBe(true);
    buttons[1].click();
    http.expectOne(environment.apiUrl + '/admin/usuarios?page=1&size=20').flush({ items: [], page: 1, size: 20, totalElements: 21, totalPages: 2 });
    expect(fixture.nativeElement.textContent).toContain('Nenhum usuário nesta página');
  });

  it('exibe falha de autorizacao e permite repetir a consulta', () => {
    const fixture = TestBed.createComponent(AdminComponent);
    fixture.detectChanges();
    http.expectOne(environment.apiUrl + '/admin/usuarios?page=0&size=20').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Acesso restrito');
    fixture.componentInstance.loadPage(0);
    http.expectOne(environment.apiUrl + '/admin/usuarios?page=0&size=20').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(fixture.nativeElement.textContent).toContain('Não foi possível');
  });
});
