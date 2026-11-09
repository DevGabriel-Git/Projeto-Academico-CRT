import { TestBed } from '@angular/core/testing';
import { UiPreferences } from './ui-preferences.service';

describe('preferencias visuais', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.classList.remove('dark');
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
  });
  it('persiste o modo escuro e restaura depois de recarregar', () => {
    const preferences = TestBed.inject(UiPreferences);
    preferences.setTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    TestBed.resetTestingModule();
    expect(TestBed.inject(UiPreferences).theme()).toBe('dark');
    TestBed.inject(UiPreferences).setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
  it('acompanha o tema do sistema sem sobrescrever escolha explicita', () => {
    let changed: () => void = () => {};
    const media = {
      matches: true,
      addEventListener: (_: string, listener: () => void) => (changed = listener),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('matchMedia', () => media);
    const preferences = TestBed.inject(UiPreferences);
    expect(preferences.dark()).toBe(true);
    media.matches = false;
    changed();
    expect(preferences.dark()).toBe(false);
    preferences.setTheme('dark');
    changed();
    expect(preferences.dark()).toBe(true);
  });
  it('limpa favoritos e privacidade ao encerrar a sessao, preservando tema', () => {
    const preferences = TestBed.inject(UiPreferences);
    preferences.setTheme('dark');
    preferences.toggleFavorite(7);
    preferences.togglePrivacy();
    expect(preferences.favorites()).toEqual([7]);
    preferences.clearSession();
    expect(preferences.favorites()).toEqual([]);
    expect(preferences.privateValues()).toBe(false);
    expect(sessionStorage.getItem('crt:favorites')).toBeNull();
    expect(preferences.theme()).toBe('dark');
  });
});
