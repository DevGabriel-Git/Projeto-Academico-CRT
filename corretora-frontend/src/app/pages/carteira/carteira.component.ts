import { Component, effect, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Carteira } from '../../models/models';
import { PortfolioStore } from '../../services/portfolio-store.service';
import { UiPreferences } from '../../services/ui-preferences.service';
import { brokerName, currencyOf, Currency, summary, validQuote } from '../../shared/portfolio';
import { IconComponent } from '../../shared/icon.component';
import { MoneyPipe } from '../../shared/money.pipe';
import { DialogComponent } from '../../shared/dialog.component';
import { OperationDrawer } from '../../shared/operation-drawer.component';

@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IconComponent,
    MoneyPipe,
    DialogComponent,
    OperationDrawer,
  ],
  templateUrl: './carteira.component.html',
})
export class CarteiraComponent implements OnInit {
  currency: Currency = 'BRL';
  query = '';
  broker = '';
  sort = 'value';
  details: Carteira | null = null;
  seed?: Carteira;
  initialStock: number | null = null;
  initialType = 'COMPRA';
  readonly operationOpen = signal(false);
  private requested = false;
  readonly brokerName = brokerName;
  readonly currencyOf = currencyOf;
  constructor(
    public store: PortfolioStore,
    public ui: UiPreferences,
    route: ActivatedRoute,
  ) {
    this.initialStock = Number(route.snapshot.queryParamMap.get('acaoId')) || null;
    this.requested = !!this.initialStock || route.snapshot.queryParamMap.get('operar') === 'true';
    this.query = route.snapshot.queryParamMap.get('ticker') || '';
    effect(() => {
      if (this.store.updated() && this.requested) {
        this.operationOpen.set(true);
        this.requested = false;
      }
    });
  }
  ngOnInit(): void {
    this.store.load();
  }
  get totals() {
    return summary(this.store.positions(), this.currency);
  }
  get positions() {
    const query = this.query.trim().toLowerCase();
    return this.store
      .positions()
      .filter(
        (position) =>
          currencyOf(position) === this.currency &&
          position.quantidade > 0 &&
          (!this.broker || position.corretora?.id === Number(this.broker)) &&
          `${position.acao?.ticker} ${position.acao?.nomeEmpresa}`.toLowerCase().includes(query),
      )
      .sort((a, b) =>
        this.sort === 'ticker'
          ? (a.acao?.ticker || '').localeCompare(b.acao?.ticker || '')
          : b.quantidade * b.precoMedio - a.quantidade * a.precoMedio,
      );
  }
  result(position: Carteira): number | null {
    const quote = position.acao?.cotacaoAtual;
    return validQuote(quote) ? position.quantidade * (quote - position.precoMedio) : null;
  }
  current(position: Carteira): number | null {
    const quote = position.acao?.cotacaoAtual;
    return validQuote(quote) ? position.quantidade * quote : null;
  }
  operate(position?: Carteira, type = 'COMPRA'): void {
    this.details = null;
    this.seed = position;
    this.initialType = type;
    this.initialStock = null;
    this.operationOpen.set(true);
  }
  completed(): void {
    this.operationOpen.set(false);
    this.store.load();
  }
}
