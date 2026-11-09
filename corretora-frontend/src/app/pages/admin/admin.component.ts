import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/icon.component';
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
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  users: UserSession[] = [];
  query = '';
  profile = '';
  get filteredUsers() {
    return this.users.filter(
      (user) =>
        (!this.profile || user.perfil === this.profile) &&
        `${user.nome} ${user.email}`.toLowerCase().includes(this.query.trim().toLowerCase()),
    );
  }
  page = 0;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  error = '';

  constructor(
    private http: HttpClient,
    private changes: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(page: number): void {
    if (this.loading || page < 0) return;
    this.loading = true;
    this.error = '';
    this.http
      .get<UsersPage>(environment.apiUrl + '/admin/usuarios', { params: { page, size: 20 } })
      .subscribe({
        next: (response) => {
          this.users = response.items;
          this.query = '';
          this.profile = '';
          this.page = response.page;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.loading = false;
          this.changes.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.users = [];
          this.error =
            error.status === 403
              ? 'Acesso restrito a administradores.'
              : 'Não foi possível carregar os usuários.';
          this.loading = false;
          this.changes.detectChanges();
        },
      });
  }
}
