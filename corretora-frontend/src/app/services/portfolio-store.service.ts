import { Injectable, signal } from '@angular/core';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { Acao, Carteira, Corretora, HistoricoCarteira } from '../models/models';
import { brokerName, currencyOf, Movement } from '../shared/portfolio';
import { CarteiraService } from './carteira.service';
import { AcaoService } from './acao.service';
import { CorretoraService } from './corretora.service';

@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  readonly positions = signal<Carteira[]>([]);
  readonly stocks = signal<Acao[]>([]);
  readonly brokers = signal<Corretora[]>([]);
  readonly movements = signal<Movement[]>([]);
  readonly loading = signal(false);
  readonly historyLoading = signal(false);
  readonly error = signal('');
  readonly historyError = signal('');
  readonly updated = signal<Date | null>(null);
  private requests = new Subscription();

  constructor(
    private wallets: CarteiraService,
    private assets: AcaoService,
    private companies: CorretoraService,
  ) {}

  load(): void {
    this.queryCore((response) => this.applyCore(response));
  }

  loadWithHistory(): void {
    this.queryCore((response) => {
      this.applyCore(response);
      this.loadHistory(response.positions);
    });
  }

  private queryCore(
    loaded: (response: { positions: Carteira[]; stocks: Acao[]; brokers: Corretora[] }) => void,
  ): void {
    this.clear();
    this.loading.set(true);
    this.requests.add(
      forkJoin({
        positions: this.wallets.listar(),
        stocks: this.assets.listar(),
        brokers: this.companies.listar(),
      }).subscribe({
        next: loaded,
        error: () => {
          this.loading.set(false);
          this.error.set('Não foi possível carregar seus dados. Tente novamente.');
        },
      }),
    );
  }

  private applyCore(response: {
    positions: Carteira[];
    stocks: Acao[];
    brokers: Corretora[];
  }): void {
    this.positions.set(response.positions);
    this.stocks.set(response.stocks);
    this.brokers.set(response.brokers);
    this.updated.set(new Date());
    this.loading.set(false);
  }

  clear(): void {
    this.requests.unsubscribe();
    this.requests = new Subscription();
    this.positions.set([]);
    this.stocks.set([]);
    this.brokers.set([]);
    this.movements.set([]);
    this.error.set('');
    this.historyError.set('');
    this.loading.set(false);
    this.historyLoading.set(false);
    this.updated.set(null);
  }

  private loadHistory(positions: Carteira[]): void {
    if (!positions.length) return;
    this.historyLoading.set(true);
    const histories = positions.map((position) =>
      this.wallets.listarHistorico(position.id).pipe(
        catchError(() => {
          this.historyError.set(
            'Parte do histórico não pôde ser carregada. Os totais de movimentação estão incompletos.',
          );
          return of([]);
        }),
      ),
    );
    this.requests.add(
      forkJoin(histories).subscribe((histories) => {
        this.applyHistory(histories, positions);
        this.historyLoading.set(false);
      }),
    );
  }
  private applyHistory(histories: HistoricoCarteira[][], positions: Carteira[]): void {
    this.movements.set(
      histories
        .flatMap((history, index) =>
          history.map((operation) => ({
            ...operation,
            ticker: positions[index].acao?.ticker || 'Sem ticker',
            currency: currencyOf(positions[index]),
            broker: brokerName(positions[index]),
          })),
        )
        .sort((a, b) => new Date(b.dataOperacao).getTime() - new Date(a.dataOperacao).getTime()),
    );
  }
}
