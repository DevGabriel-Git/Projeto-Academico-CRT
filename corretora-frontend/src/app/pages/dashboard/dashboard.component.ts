import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PortfolioStore } from '../../services/portfolio-store.service';
import { UiPreferences } from '../../services/ui-preferences.service';
import { allocation, Currency, summary } from '../../shared/portfolio';
import { MoneyPipe } from '../../shared/money.pipe';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MoneyPipe, IconComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  currency: Currency = 'BRL';
  period = 180;
  group: 'asset' | 'broker' = 'asset';
  selectedAllocation = '';
  readonly colors = ['#e97738', '#e9b38b', '#9486b4', '#6b9c8f', '#8795a6', '#cf9ba4'];
  constructor(
    public store: PortfolioStore,
    public ui: UiPreferences,
  ) {}
  ngOnInit(): void {
    this.store.loadWithHistory();
  }
  get totals() {
    return summary(this.store.positions(), this.currency);
  }
  get groups() {
    return allocation(this.store.positions(), this.currency, this.group);
  }
  get visibleGroups() {
    const groups = this.groups;
    if (groups.length <= 5) return groups;
    return [
      ...groups.slice(0, 5),
      {
        name: 'Outros',
        value: groups.slice(5).reduce((sum, item) => sum + item.value, 0),
        percent: groups.slice(5).reduce((sum, item) => sum + item.percent, 0),
      },
    ];
  }
  get donut(): string {
    let previous = 0;
    return (
      'conic-gradient(' +
      this.visibleGroups
        .map((item, index) => {
          const start = previous;
          previous += item.percent;
          return `${this.colors[index]} ${start}% ${previous}%`;
        })
        .join(',') +
      ')'
    );
  }
  get latest() {
    return this.store
      .movements()
      .filter((item) => item.currency === this.currency)
      .slice(0, 4);
  }
  get bars() {
    const start = new Date();
    start.setDate(start.getDate() - this.period);
    const dates = this.store
      .movements()
      .filter((item) => item.currency === this.currency && new Date(item.dataOperacao) >= start);
    const months = new Map<string, { label: string; buy: number; sale: number }>();
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= new Date()) {
      months.set(this.monthKey(cursor), {
        label: cursor.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        buy: 0,
        sale: 0,
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    dates.forEach((item) => {
      const bucket = months.get(this.monthKey(new Date(item.dataOperacao)));
      if (bucket) {
        if (item.tipo === 'COMPRA') bucket.buy += item.valorTotal;
        else bucket.sale += item.valorTotal;
      }
    });
    const maximum = Math.max(1, ...[...months.values()].flatMap((item) => [item.buy, item.sale]));
    return [...months.values()].map((item) => ({
      ...item,
      buyHeight: (item.buy / maximum) * 100,
      saleHeight: (item.sale / maximum) * 100,
    }));
  }
  get hasChartData(): boolean {
    return this.bars.some((item) => item.buy > 0 || item.sale > 0);
  }
  selectAllocation(name: string): void {
    this.selectedAllocation = this.selectedAllocation === name ? '' : name;
  }
  private monthKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}`;
  }
}
