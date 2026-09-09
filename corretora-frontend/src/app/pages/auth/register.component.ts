import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0b0e] py-12 px-4">
      <div class="bg-white dark:bg-[#0d0f14] p-8 rounded-xl border border-orange-500 dark:border-[#1e2330] w-full max-w-lg shadow-lg">
        <div class="text-center mb-8">
          <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00d4aa] to-[#0099ff] mx-auto flex items-center justify-center font-bold text-black text-xl mb-4">C</div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Abra sua conta</h1>
          <p class="text-slate-500 text-sm mt-2">Preencha seus dados para começar a investir</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Nome Completo</label>
            <input type="text" [(ngModel)]="user.nome" name="nome" required
                   class="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-orange-200 dark:border-[#1e2330] rounded-lg px-4 py-3 text-slate-800 dark:text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   placeholder="Digite seu nome completo" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">CPF</label>
            <input type="text" [(ngModel)]="user.cpf" name="cpf" required maxlength="14"
                   class="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-orange-200 dark:border-[#1e2330] rounded-lg px-4 py-3 text-slate-800 dark:text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   placeholder="000.000.000-00" />
          </div>
          
          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">E-mail</label>
            <input type="email" [(ngModel)]="user.email" name="email" required
                   class="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-orange-200 dark:border-[#1e2330] rounded-lg px-4 py-3 text-slate-800 dark:text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   placeholder="Digite seu melhor e-mail" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Senha</label>
            <input type="password" [(ngModel)]="user.senha" name="senha" required
                   class="w-full bg-slate-50 dark:bg-[#0a0b0e] border border-orange-200 dark:border-[#1e2330] rounded-lg px-4 py-3 text-slate-800 dark:text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   placeholder="Crie uma senha forte" />
          </div>

          <div *ngIf="error" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800/30">
            {{ error }}
          </div>

          <button type="submit" [disabled]="loading"
                  class="w-full bg-orange-500 text-white font-bold rounded-lg py-3 hover:bg-orange-600 transition-colors disabled:opacity-50 mt-6 shadow-sm">
            {{ loading ? 'Criando conta...' : 'Criar Conta' }}
          </button>
        </form>
        
        <div class="mt-8 text-center text-sm text-slate-600">
          Já possui conta? 
          <a routerLink="/login" class="text-orange-500 hover:text-orange-600 font-semibold ml-1">Fazer login</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  user = { nome: '', email: '', cpf: '', senha: '' };
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  validarCpf(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
  }

  onSubmit() {
    if (!this.user.nome || !this.user.email || !this.user.cpf || !this.user.senha) {
      this.error = 'Preencha todos os campos';
      return;
    }
    
    const cpfLimpo = this.user.cpf.replace(/\D/g, '');
    if (!this.validarCpf(cpfLimpo)) {
      this.error = 'CPF inválido';
      return;
    }
    this.user.cpf = cpfLimpo;

    this.loading = true;
    this.error = '';
    this.authService.register(this.user).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        this.error = e?.error?.message || 'Erro ao criar conta. Verifique seus dados.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
