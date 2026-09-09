import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0b0e]">
      <div class="bg-white dark:bg-[#0d0f14] p-8 rounded-xl border border-orange-500 dark:border-[#1e2330] w-full max-w-md shadow-lg">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#0099ff] mx-auto flex items-center justify-center font-bold text-black text-xl mb-4">C</div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Recuperar Senha</h1>
          <p class="text-slate-500 text-sm mt-2">Informe seu e-mail ou CPF para receber as instruções</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Login (E-mail ou CPF)</label>
            <input type="text" [(ngModel)]="login" name="login" required
                   class="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-orange-200 dark:border-[#1e2330] rounded-lg px-4 py-3 text-slate-800 dark:text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   placeholder="Digite seu e-mail ou CPF" />
          </div>

          <div *ngIf="message" class="bg-[#0a2e1e] border border-[#00d4aa]/30 rounded-lg px-3 py-2 text-[#00d4aa] text-xs">
            {{ message }}
          </div>

          <button type="submit" [disabled]="loading"
                  class="w-full bg-orange-500 text-white font-bold rounded-lg py-3 hover:bg-orange-600 transition-colors disabled:opacity-50 mt-6 shadow-sm">
            {{ loading ? 'Enviando...' : 'Recuperar' }}
          </button>
        </form>
        
        <div class="mt-8 text-center text-sm text-slate-600">
          <a routerLink="/login" class="text-orange-500 hover:text-orange-600 font-semibold ml-1">Voltar para o login</a>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  login = '';
  loading = false;
  message = '';

  onSubmit() {
    this.loading = true;
    setTimeout(() => {
      this.message = 'Instruções enviadas para seu e-mail.';
      this.loading = false;
    }, 1500);
  }
}
