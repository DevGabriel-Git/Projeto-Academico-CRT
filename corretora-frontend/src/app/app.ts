import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { UiPreferences, Theme } from './services/ui-preferences.service';
import { IconComponent } from './shared/icon.component';
import { DialogComponent } from './shared/dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    FormsModule,
    IconComponent,
    DialogComponent,
  ],
  template: `
    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <div class="app-shell" [class.auth-layout]="!isLoggedIn">
      @if (isLoggedIn) {
        @if (mobileMenu) {
          <button
            class="sidebar-shade"
            aria-label="Fechar navegação"
            (click)="mobileMenu = false"
          ></button>
        }
        <aside class="sidebar" [class.open]="mobileMenu" aria-label="Navegação principal">
          <a routerLink="/dashboard" class="brand" (click)="mobileMenu = false"
            ><span class="brand-mark">c</span
            ><span><strong>CRT</strong><small>investimentos</small></span></a
          >
          <p class="nav-label">SEU PORTFÓLIO</p>
          <nav>
            @for (item of navigation; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="active-nav"
                class="nav-link"
                (click)="mobileMenu = false"
              >
                <crt-icon [name]="item.icon" /><span>{{ item.label }}</span
                ><span class="nav-index">{{ item.index }}</span>
              </a>
            }
          </nav>
          <div class="sidebar-bottom">
            <div class="sidebar-note">
              <crt-icon name="shield" />
              <p style="margin-top:10px">
                Seu portfólio, no seu controle.<br />Organize. Acompanhe. Decida.
              </p>
            </div>
            <div class="user-box">
              <span class="avatar">{{ userInitials }}</span>
              <div style="flex:1">
                <strong>{{ userName }}</strong
                ><small>{{ isAdmin ? 'Administrador' : 'Conta pessoal' }}</small>
              </div>
              <button class="icon-button" (click)="logout()" aria-label="Sair da conta">
                <crt-icon name="logout" />
              </button>
            </div>
          </div>
        </aside>
      }
      <div class="workspace">
        <header class="topbar">
          @if (isLoggedIn) {
            <div class="breadcrumb">
              <button
                class="icon-button mobile-only"
                aria-label="Abrir navegação"
                [attr.aria-expanded]="mobileMenu"
                (click)="mobileMenu = !mobileMenu"
              >
                <crt-icon name="menu" /></button
              ><span>Meu espaço</span><crt-icon name="chevron" /><strong>{{ pageTitle }}</strong>
            </div>
          }
          <div class="top-actions">
            @if (isLoggedIn) {
              <button
                class="search-trigger"
                (click)="commandOpen = true"
                aria-label="Buscar uma página"
              >
                <crt-icon name="search" /><span>Ir para...</span><kbd>Ctrl K</kbd>
              </button>
              <button
                class="icon-button"
                [class.active]="ui.privateValues()"
                [attr.aria-pressed]="ui.privateValues()"
                [attr.aria-label]="ui.privateValues() ? 'Mostrar valores' : 'Ocultar valores'"
                (click)="ui.togglePrivacy()"
              >
                <crt-icon name="eye" />
              </button>
            }
            <div class="theme-switch" aria-label="Aparência">
              @for (option of themeOptions; track option.value) {
                <button
                  [class.selected]="ui.theme() === option.value"
                  [attr.aria-pressed]="ui.theme() === option.value"
                  [attr.aria-label]="option.label"
                  [title]="option.label"
                  (click)="ui.setTheme(option.value)"
                >
                  <crt-icon [name]="option.icon" />
                </button>
              }
            </div>
          </div>
        </header>
        <main id="conteudo" class="app-content"><router-outlet /></main>
      </div>
    </div>
    <crt-dialog [open]="commandOpen" title="Para onde vamos?" (dismissed)="commandOpen = false">
      <label class="field"
        >Buscar uma página<input
          [(ngModel)]="commandQuery"
          placeholder="Carteira, ativos, histórico..."
      /></label>
      <nav class="command-list" aria-label="Resultados da busca">
        @for (item of matchingPages; track item.path) {
          <a [routerLink]="item.path" (click)="commandOpen = false"
            ><crt-icon [name]="item.icon" />{{ item.label
            }}<crt-icon name="arrow" style="margin-left:auto"
          /></a>
        }
        @if (!matchingPages.length) {
          <p class="hint">Nenhuma página encontrada.</p>
        }
      </nav>
    </crt-dialog>
    @if (ui.toast()) {
      <div class="toast" role="status">
        <crt-icon name="check" /><span>{{ ui.toast() }}</span
        ><button aria-label="Dispensar mensagem" (click)="ui.toast.set('')">
          <crt-icon name="close" />
        </button>
      </div>
    }
  `,
})
export class App {
  mobileMenu = false;
  commandOpen = false;
  commandQuery = '';
  readonly themeOptions: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Modo claro', icon: 'sun' },
    { value: 'dark', label: 'Modo escuro', icon: 'moon' },
    { value: 'system', label: 'Tema do sistema', icon: 'monitor' },
  ];
  constructor(
    private authService: AuthService,
    private router: Router,
    public ui: UiPreferences,
  ) {}
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  get navigation() {
    const pages = [
      { path: '/dashboard', label: 'Visão geral', icon: 'dashboard', index: '01' },
      { path: '/carteira', label: 'Minha carteira', icon: 'wallet', index: '02' },
      { path: '/acoes', label: 'Ativos', icon: 'chart', index: '03' },
      { path: '/corretoras', label: 'Corretoras', icon: 'building', index: '04' },
      { path: '/historico', label: 'Histórico', icon: 'history', index: '05' },
    ];
    return this.isAdmin
      ? [...pages, { path: '/admin', label: 'Administração', icon: 'shield', index: '06' }]
      : pages;
  }
  get pageTitle(): string {
    return (
      this.navigation.find((item) => this.router.url.startsWith(item.path))?.label || 'Meu espaço'
    );
  }
  get matchingPages() {
    return this.navigation.filter((item) =>
      item.label.toLocaleLowerCase('pt-BR').includes(this.commandQuery.toLocaleLowerCase('pt-BR')),
    );
  }
  get userName(): string {
    return this.storedName().split(' ')[0];
  }
  get userInitials(): string {
    const parts = this.storedName().trim().split(/\s+/);
    return (
      parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].substring(0, 2)
    ).toUpperCase();
  }
  logout(): void {
    this.mobileMenu = false;
    this.commandOpen = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  @HostListener('document:keydown', ['$event'])
  shortcut(event: KeyboardEvent): void {
    if (this.isLoggedIn && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.commandOpen = true;
    }
  }
  @HostListener('window:storage', ['$event'])
  synchronizeSession(event: StorageEvent): void {
    if (event.key !== 'token' && event.key !== null) return;
    this.authService.clearClientState();
    this.mobileMenu = false;
    this.commandOpen = false;
    this.router.navigate(['/login'], { queryParams: { reason: 'changed' } });
  }
  private storedName(): string {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return typeof user?.nome === 'string' && user.nome.trim() ? user.nome : 'Usuário';
    } catch {
      return 'Usuário';
    }
  }
}
