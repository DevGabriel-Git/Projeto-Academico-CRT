import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen bg-white dark:bg-[#0a0b0e] text-slate-800 dark:text-slate-200 overflow-hidden">
      
      <!-- Layout Principal (Só mostra logado) -->
      <aside *ngIf="isLoggedIn" class="w-56 bg-slate-50 dark:bg-[#0d0f14] border-r border-orange-500 dark:border-[#1e2330] flex flex-col flex-shrink-0">
        <div class="p-4 border-b border-orange-500 dark:border-[#1e2330]">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#0099ff] flex items-center justify-center font-bold text-black text-sm">C</div>
            <div>
              <div class="text-black dark:text-white font-bold tracking-widest text-base">CRT</div>
              <div class="text-[10px] text-slate-600 tracking-wider">Gestão de Ações</div>
            </div>
          </div>
        </div>

        <nav class="p-2 flex-1">
          <p class="text-[10px] text-slate-600 tracking-widest uppercase px-2 py-2 mt-2">Principal</p>
          <a routerLink="/dashboard" routerLinkActive="active-nav"
             class="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-orange-100 dark:hover:bg-[#1a1f2e] hover:text-slate-800 dark:text-slate-200 dark:hover:text-white mb-1 transition-all">
            <i class="ti ti-layout-dashboard text-base"></i> Dashboard
          </a>
          <a routerLink="/corretoras" routerLinkActive="active-nav"
             class="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-orange-100 dark:hover:bg-[#1a1f2e] hover:text-slate-800 dark:text-slate-200 dark:hover:text-white mb-1 transition-all">
            <i class="ti ti-building-bank text-base"></i> Corretoras
          </a>
          <a routerLink="/acoes" routerLinkActive="active-nav"
             class="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-orange-100 dark:hover:bg-[#1a1f2e] hover:text-slate-800 dark:text-slate-200 dark:hover:text-white mb-1 transition-all">
            <i class="ti ti-chart-candle text-base"></i> Ações
          </a>
          <a routerLink="/carteira" routerLinkActive="active-nav"
             class="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-orange-100 dark:hover:bg-[#1a1f2e] hover:text-slate-800 dark:text-slate-200 dark:hover:text-white mb-1 transition-all">
            <i class="ti ti-wallet text-base"></i> Carteira
          </a>
          <button (click)="toggleTheme()"
             class="w-full text-left nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-orange-100 dark:hover:bg-[#1a1f2e] hover:text-slate-800 dark:text-slate-200 dark:hover:text-white mb-1 transition-all">
            <i class="text-base" [class]="isDark ? 'ti ti-sun' : 'ti ti-moon'"></i> Modo {{ isDark ? 'Claro' : 'Escuro' }}
          </button>
          
          <p class="text-[10px] text-slate-600 tracking-widest uppercase px-2 py-2 mt-3">Operações</p>
          <a routerLink="/historico" routerLinkActive="active-nav"
             class="nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-orange-100 dark:hover:bg-[#1a1f2e] hover:text-slate-800 dark:text-slate-200 dark:hover:text-white mb-1 transition-all">
            <i class="ti ti-history text-base"></i> Histórico
          </a>
        </nav>
        
        <div class="p-4 border-t border-orange-500 dark:border-[#1e2330]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-[#1e2330] flex items-center justify-center text-[11px] text-[#00d4aa] font-bold border border-[#2a3040]">{{ userInitials }}</div>
              <div>
                <div class="text-xs text-slate-800 dark:text-slate-300 font-medium">{{ userName }}</div>
              </div>
            </div>
            <button (click)="logout()" class="text-xs text-slate-500 hover:text-red-500"><i class="ti ti-logout"></i> Sair</button>
          </div>
        </div>
      </aside>

      <main class="flex-1 flex flex-col overflow-hidden w-full">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .active-nav {
      background: #0f1e2e !important;
      color: #00d4aa !important;
      border-left: 2px solid #00d4aa;
    }
  `]
})
export class App {
  isDark = false;

  constructor(private authService: AuthService, private router: Router) {}

  get isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  get userName(): string {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.nome) return u.nome.split(' ')[0];
      } catch (e) {}
    }
    return 'Usuário';
  }

  get userInitials(): string {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.nome) {
           const parts = u.nome.split(' ');
           if (parts.length > 1) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
           return parts[0].substring(0, 2).toUpperCase();
        }
      } catch (e) {}
    }
    return 'US';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.isDark = document.documentElement.classList.contains('dark');
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
