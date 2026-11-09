import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0b0e] px-4">
      <section class="bg-white dark:bg-[#0d0f14] p-8 rounded-xl border border-orange-500 dark:border-[#1e2330] w-full max-w-md shadow-lg" aria-labelledby="recovery-title">
        <h1 id="recovery-title" class="text-2xl font-bold text-slate-800 dark:text-white mb-4">Recuperação de senha indisponível</h1>
        <p class="text-slate-600 dark:text-slate-300 mb-6">A recuperação automática por e-mail está indisponível neste ambiente.</p>
        <a routerLink="/login" class="inline-block text-orange-600 hover:text-orange-700 font-semibold">Voltar para o login</a>
      </section>
    </main>
  `
})
export class ForgotPasswordComponent {}
