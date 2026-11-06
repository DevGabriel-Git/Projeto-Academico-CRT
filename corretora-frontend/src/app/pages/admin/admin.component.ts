import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserSession } from '../../services/auth.service';

interface UsersPage {
  items: UserSession[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="p-6 overflow-auto h-full" aria-labelledby="admin-title">
      <p class="text-orange-600 text-sm font-semibold mb-2">Administração</p>
      <h1 id="admin-title" class="text-2xl font-bold mb-2">Usuários da corretora</h1>
      <p class="text-slate-500 mb-6">Consulte os perfis cadastrados. As carteiras e operações permanecem privadas de cada titular.</p>
      <p *ngIf="loading" role="status">Carregando usuários...</p>
      <p *ngIf="error" role="alert" class="text-red-600 mb-4">{{ error }}</p>
      <button *ngIf="error" (click)="loadPage(page)" class="text-orange-600 underline mb-4">Tentar novamente</button>
      <div *ngIf="!loading && !error" class="border border-slate-200 dark:border-slate-700 rounded-xl overflow-auto">
        <table class="w-full text-left text-sm">
          <caption class="text-left p-4 text-slate-500">{{ totalElements }} usuários cadastrados</caption>
          <thead class="bg-slate-100 dark:bg-slate-800"><tr>
            <th scope="col" class="p-4">Nome</th><th scope="col" class="p-4">E-mail</th><th scope="col" class="p-4">Perfil</th>
          </tr></thead>
          <tbody><tr *ngFor="let user of users" class="border-t border-slate-200 dark:border-slate-700">
            <td class="p-4">{{ user.nome }}</td><td class="p-4">{{ user.email }}</td>
            <td class="p-4">{{ user.perfil === 'ADMIN' ? 'Administrador' : 'Usuário' }}</td>
          </tr></tbody>
        </table>
        <p *ngIf="users.length === 0" class="p-4">Nenhum usuário nesta página.</p>
      </div>
      <nav *ngIf="!error" aria-label="Paginação de usuários" class="flex items-center gap-4 mt-4">
        <button (click)="loadPage(page - 1)" [disabled]="loading || page === 0" class="px-4 py-2 border rounded-lg disabled:opacity-40">Anterior</button>
        <span>Página {{ page + 1 }} de {{ totalPages || 1 }}</span>
        <button (click)="loadPage(page + 1)" [disabled]="loading || page + 1 >= totalPages" class="px-4 py-2 border rounded-lg disabled:opacity-40">Próxima</button>
      </nav>
    </section>
  `
})
export class AdminComponent implements OnInit {
  users: UserSession[] = [];
  page = 0;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  error = '';

  constructor(private http: HttpClient, private changes: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadPage(0); }

  loadPage(page: number): void {
    if (this.loading || page < 0) return;
    this.loading = true;
    this.error = '';
    this.http.get<UsersPage>(environment.apiUrl + '/admin/usuarios', { params: { page, size: 20 } }).subscribe({
      next: response => {
        this.users = response.items;
        this.page = response.page;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
        this.changes.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.users = [];
        this.error = error.status === 403 ? 'Acesso restrito a administradores.' : 'Não foi possível carregar os usuários.';
        this.loading = false;
        this.changes.detectChanges();
      }
    });
  }
}
