import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Corretora } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CorretoraService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(): Observable<Corretora[]> {
    return this.http.get<Corretora[]>(`${this.api}/corretoras`);
  }

  buscarPorId(id: number): Observable<Corretora> {
    return this.http.get<Corretora>(`${this.api}/corretoras/${id}`);
  }

  cadastrar(cnpj: string): Observable<Corretora> {
    return this.http.post<Corretora>(`${this.api}/corretoras?cnpj=${cnpj}`, {});
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/corretoras/${id}`);
  }
}
