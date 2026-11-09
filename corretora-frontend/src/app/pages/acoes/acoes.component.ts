import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Acao } from '../../models/models';
import { PortfolioStore } from '../../services/portfolio-store.service';
import { AcaoService } from '../../services/acao.service';
import { UiPreferences } from '../../services/ui-preferences.service';
import { IconComponent } from '../../shared/icon.component';
import { MoneyPipe } from '../../shared/money.pipe';
import { DialogComponent } from '../../shared/dialog.component';

@Component({
  selector: 'app-acoes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent, MoneyPipe, DialogComponent],
  templateUrl: './acoes.component.html',
})
export class AcoesComponent implements OnInit, OnDestroy {
  query = '';
  market = '';
  onlyFavorites = false;
  sort = 'ticker';
  catalogOpen = false;
  readonly catalog = signal<{ ticker: string; mercado: string }[]>([]);
  readonly catalogLoading = signal(false);
  readonly catalogError = signal('');
  modal = false;
  ticker = '';
  selectedMarket = 'BR';
  brokerCnpj = '';
  readonly error = signal('');
  readonly saving = signal(false);
  readonly refreshing = signal<number[]>([]);
  private requests = new Subscription();
  constructor(
    public store: PortfolioStore,
    private api: AcaoService,
    public ui: UiPreferences,
  ) {}
  ngOnInit(): void {
    this.store.load();
  }
  ngOnDestroy(): void {
    this.requests.unsubscribe();
  }
  get stocks() {
    const query = this.query.trim().toLowerCase();
    return this.store
      .stocks()
      .filter(
        (stock) =>
          (!this.market || stock.mercado === this.market) &&
          (!this.onlyFavorites || this.ui.favorites().includes(stock.id)) &&
          `${stock.ticker} ${stock.nomeEmpresa}`.toLowerCase().includes(query),
      )
      .sort((a, b) =>
        this.sort === 'price'
          ? (b.cotacaoAtual || 0) - (a.cotacaoAtual || 0)
          : a.ticker.localeCompare(b.ticker),
      );
  }
  get catalogItems() {
    return this.catalog().filter(
      (item) =>
        (!this.market || item.mercado === this.market) &&
        item.ticker.toLowerCase().includes(this.query.trim().toLowerCase()),
    );
  }
  explore(): void {
    this.catalogOpen = true;
    this.catalogLoading.set(true);
    this.catalogError.set('');
    this.requests.add(
      this.api.listarDisponiveis().subscribe({
        next: (items) => {
          this.catalog.set(items);
          this.catalogLoading.set(false);
        },
        error: () => {
          this.catalogLoading.set(false);
          this.catalogError.set(
            'Não foi possível consultar o catálogo. Você ainda pode adicionar um ticker manualmente.',
          );
        },
      }),
    );
  }
  chooseTicker(item: { ticker: string; mercado: string }): void {
    this.openCreate();
    this.ticker = item.ticker;
    this.selectedMarket = item.mercado;
  }
  openCreate(): void {
    this.ticker = '';
    this.brokerCnpj = '';
    this.error.set('');
    this.modal = true;
  }
  save(): void {
    if (this.saving()) return;
    if (!/^[A-Za-z0-9.^-]{1,20}$/.test(this.ticker.trim()) || !this.brokerCnpj) {
      this.error.set('Informe um ticker válido e selecione a corretora.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.requests.add(
      this.api
        .cadastrar(this.ticker.trim().toUpperCase(), this.selectedMarket, this.brokerCnpj)
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.modal = false;
            this.catalogOpen = false;
            this.ui.notify('Ativo cadastrado com sucesso.');
            this.store.load();
          },
          error: (error) => {
            this.saving.set(false);
            this.error.set(
              error?.error?.message ||
                'Não foi possível cadastrar. Confira o ticker e a disponibilidade do provedor.',
            );
          },
        }),
    );
  }
  refresh(stock: Acao): void {
    if (this.refreshing().includes(stock.id)) return;
    this.refreshing.update((ids) => [...ids, stock.id]);
    this.requests.add(
      this.api.atualizarCotacao(stock.id).subscribe({
        next: (updated) => {
          this.store.stocks.update((stocks) =>
            stocks.map((item) => (item.id === updated.id ? updated : item)),
          );
          this.refreshing.update((ids) => ids.filter((id) => id !== stock.id));
          this.ui.notify(`Cotação de ${updated.ticker} atualizada.`);
        },
        error: () => {
          this.refreshing.update((ids) => ids.filter((id) => id !== stock.id));
          this.ui.notify('Cotação indisponível no momento. A última informação foi preservada.');
        },
      }),
    );
  }
}
