import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PortfolioStore } from '../../services/portfolio-store.service';
import { UiPreferences } from '../../services/ui-preferences.service';
import { Currency, downloadCsv } from '../../shared/portfolio';
import { MoneyPipe } from '../../shared/money.pipe';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule, MoneyPipe, IconComponent],
  templateUrl: './historico.component.html',
})
export class HistoricoComponent implements OnInit {
  query = '';
  type = '';
  currency: Currency = 'BRL';
  period = 'all';
  from = '';
  to = '';
  page = 0;
  readonly pageSize = 15;
  constructor(
    public store: PortfolioStore,
    public ui: UiPreferences,
    route: ActivatedRoute,
  ) {
    this.query = route.snapshot.queryParamMap.get('ticker') || '';
  }
  ngOnInit(): void {
    this.store.loadWithHistory();
  }
  get invalidRange(): boolean {
    return !!this.from && !!this.to && this.from > this.to;
  }
  get filtered() {
    if (this.invalidRange) return [];
    const query = this.query.trim().toLowerCase();
    const start = new Date();
    start.setDate(start.getDate() - Number(this.period));
    start.setHours(0, 0, 0, 0);
    return this.store
      .movements()
      .filter(
        (item) =>
          item.currency === this.currency &&
          (!this.type || item.tipo === this.type) &&
          `${item.ticker} ${item.broker}`.toLowerCase().includes(query) &&
          (this.period === 'all' || new Date(item.dataOperacao) >= start) &&
          (!this.from || item.dataOperacao.slice(0, 10) >= this.from) &&
          (!this.to || item.dataOperacao.slice(0, 10) <= this.to),
      );
  }
  get pages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }
  get currentPage(): number {
    return Math.min(this.page, this.pages - 1);
  }
  get visible() {
    return this.filtered.slice(
      this.currentPage * this.pageSize,
      (this.currentPage + 1) * this.pageSize,
    );
  }
  get buys(): number {
    return this.filtered
      .filter((item) => item.tipo === 'COMPRA')
      .reduce((sum, item) => sum + item.valorTotal, 0);
  }
  get sales(): number {
    return this.filtered
      .filter((item) => item.tipo === 'VENDA')
      .reduce((sum, item) => sum + item.valorTotal, 0);
  }
  reset(): void {
    this.query = '';
    this.type = '';
    this.period = 'all';
    this.from = '';
    this.to = '';
    this.page = 0;
  }
  export(): void {
    if (
      this.store.loading() ||
      this.store.historyLoading() ||
      this.store.historyError() ||
      !this.filtered.length
    )
      return;
    downloadCsv(
      [
        ['Data', 'Ativo', 'Corretora', 'Tipo', 'Quantidade', 'Moeda', 'Preco unitario', 'Total'],
        ...this.filtered.map((item) => [
          item.dataOperacao,
          item.ticker,
          item.broker,
          item.tipo,
          item.quantidade,
          item.currency,
          item.precoUnitario.toFixed(2),
          item.valorTotal.toFixed(2),
        ]),
      ],
      `crt-operacoes-${this.currency}.csv`,
    );
    this.ui.notify('Histórico filtrado exportado em CSV.');
  }
}
