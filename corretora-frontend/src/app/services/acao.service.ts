import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Acao } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AcaoService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(): Observable<Acao[]> {
    return this.http.get<Acao[]>(`${this.api}/acoes`);
  }

  listarDisponiveis(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/acoes/disponiveis`);
  }

  buscarPorId(id: number): Observable<Acao> {
    return this.http.get<Acao>(`${this.api}/acoes/${id}`);
  }

  cadastrar(ticker: string, mercado: string, cnpj: string): Observable<Acao> {
    return this.http.post<Acao>(
      `${this.api}/acoes?ticker=${ticker}&mercado=${mercado}&cnpj=${cnpj}`, {}
    );
  }

  atualizarCotacao(id: number): Observable<Acao> {
    return this.http.put<Acao>(`${this.api}/acoes/${id}/atualizar-cotacao`, {});
  }
}
