import { Injectable, OnDestroy, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class UiPreferences implements OnDestroy {
  readonly theme = signal<Theme>(this.savedTheme());
  readonly dark = signal(false);
  readonly privateValues = signal(false);
  readonly favorites = signal<number[]>(this.savedFavorites());
  readonly toast = signal('');
  private timer?: ReturnType<typeof setTimeout>;
  private media =
    typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  private systemChanged = () => this.applyTheme();

  constructor() {
    this.applyTheme();
    this.media?.addEventListener('change', this.systemChanged);
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    this.applyTheme();
    try {
      localStorage.setItem('crt:theme', theme);
    } catch {
      this.notify('Tema aplicado. O navegador não permitiu salvar a preferência.');
    }
  }

  togglePrivacy(): void {
    this.privateValues.update((value) => !value);
  }

  toggleFavorite(id: number): void {
    this.favorites.update((items) =>
      items.includes(id) ? items.filter((value) => value !== id) : [...items, id],
    );
    try {
      sessionStorage.setItem('crt:favorites', JSON.stringify(this.favorites()));
    } catch {
      this.notify('Favorito atualizado apenas nesta página.');
    }
  }

  clearSession(): void {
    this.favorites.set([]);
    this.privateValues.set(false);
    this.toast.set('');
    if (this.timer) clearTimeout(this.timer);
    try {
      sessionStorage.removeItem('crt:favorites');
    } catch {
      this.notify('Preferências da sessão encerradas.');
    }
  }

  notify(message: string): void {
    this.toast.set(message);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.toast.set(''), 4500);
  }

  ngOnDestroy(): void {
    this.media?.removeEventListener('change', this.systemChanged);
    if (this.timer) clearTimeout(this.timer);
  }

  private applyTheme(): void {
    const dark = this.theme() === 'dark' || (this.theme() === 'system' && !!this.media?.matches);
    this.dark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  }

  private savedTheme(): Theme {
    try {
      const theme = localStorage.getItem('crt:theme');
      return theme === 'light' || theme === 'dark' ? theme : 'system';
    } catch {
      return 'system';
    }
  }

  private savedFavorites(): number[] {
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem('crt:favorites') || '[]');
      return Array.isArray(value) ? value.filter((item) => Number.isInteger(item) && item > 0) : [];
    } catch {
      return [];
    }
  }
}
