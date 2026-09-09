import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carteira, HistoricoCarteira, OperacaoDTO } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CarteiraService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  listar(): Observable<Carteira[]> {
    return this.http.get<Carteira[]>(`${this.api}/carteira`);
  }

  listarPorCorretora(corretoraId: number): Observable<Carteira[]> {
    return this.http.get<Carteira[]>(`${this.api}/carteira/corretora/${corretoraId}`);
  }

  listarHistorico(carteiraId: number): Observable<HistoricoCarteira[]> {
    return this.http.get<HistoricoCarteira[]>(`${this.api}/carteira/${carteiraId}/historico`);
  }

  operar(dto: OperacaoDTO): Observable<Carteira> {
    return this.http.post<Carteira>(`${this.api}/carteira/operar`, dto);
  }
}
