import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthService } from './services/auth.service';

describe('App', () => {
  let authenticated = false;
  beforeEach(async () => {
    localStorage.clear();
    authenticated = false;
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([{ path: 'login', component: App }]), { provide: AuthService, useValue: {
        isLoggedIn: () => authenticated, logout: () => { authenticated = false; }
      }}],
    }).compileComponents();
  });
  it('oculta a navegaÃ§Ã£o enquanto nÃ£o autenticado', () => {
    const fixture = TestBed.createComponent(App); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aside')).toBeNull();
  });
  it('mostra a navegaÃ§Ã£o e o nome do usuÃ¡rio autenticado', () => {
    authenticated = true;
    localStorage.setItem('user', JSON.stringify({ nome: 'Gabriel Pereira' }));
    const fixture = TestBed.createComponent(App); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('aside').textContent).toContain('Gabriel');
    expect(fixture.componentInstance.userInitials).toBe('GP');
  });
  it('encerra a sessÃ£o ao sair', () => {
    authenticated = true;
    const fixture = TestBed.createComponent(App);
    fixture.componentInstance.logout();
    expect(fixture.componentInstance.isLoggedIn).toBe(false);
  });
});
