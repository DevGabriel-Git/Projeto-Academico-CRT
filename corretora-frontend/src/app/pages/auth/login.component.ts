import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0b0e]">
      <div class="bg-white dark:bg-[#0d0f14] p-8 rounded-xl border border-orange-500 dark:border-[#1e2330] w-full max-w-md shadow-lg">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#0099ff] mx-auto flex items-center justify-center font-bold text-black text-xl mb-4">C</div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Acesse sua conta</h1>
          <p class="text-slate-500 text-sm mt-2">Entre com seu e-mail ou CPF</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Login (E-mail ou CPF)</label>
            <input type="text" [(ngModel)]="credentials.login" name="login" required
                   class="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-orange-200 dark:border-[#1e2330] rounded-lg px-4 py-3 text-slate-800 dark:text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   placeholder="Digite seu e-mail ou CPF" />
          </div>
          
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Senha</label>
              <a href="#" class="text-xs text-orange-500 hover:text-orange-600 font-medium">Esqueceu a senha?</a>
            </div>
            <input type="password" [(ngModel)]="credentials.senha" name="senha" required
                   class="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-orange-200 dark:border-[#1e2330] rounded-lg px-4 py-3 text-slate-800 dark:text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   placeholder="Digite sua senha" />
          </div>

          <div *ngIf="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800/30">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading"
                  class="w-full bg-orange-500 text-white font-bold rounded-lg py-3 hover:bg-orange-600 transition-colors disabled:opacity-50 mt-6 shadow-sm">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
        
        <div class="mt-8 text-center text-sm text-slate-600">
          Ainda não tem conta? 
          <a routerLink="/register" class="text-orange-500 hover:text-orange-600 font-semibold ml-1">Abra sua conta</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  credentials = { login: '', senha: '' };
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    if (!this.credentials.login || !this.credentials.senha) {
      this.error = 'Preencha todos os campos';
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        this.error = 'Login ou senha incorretos';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
