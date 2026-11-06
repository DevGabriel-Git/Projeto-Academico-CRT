import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserSession {
  id: number;
  nome: string;
  email: string;
  perfil: 'USER' | 'ADMIN';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl + '/auth';

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res));
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/register`, data).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res));
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  currentUser(): Observable<UserSession> {
    return this.http.get<UserSession>(`${this.api}/me`).pipe(
      tap(user => localStorage.setItem('user', JSON.stringify(user)))
    );
  }

  isAdmin(): boolean {
    try {
      const user = JSON.parse(localStorage.getItem('user') ?? 'null') as UserSession | null;
      return user?.perfil === 'ADMIN';
    } catch {
      return false;
    }
  }
}
