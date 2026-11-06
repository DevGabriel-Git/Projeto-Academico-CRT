import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Carteira } from '../models/models';
import { CarteiraService } from '../services/carteira.service';
import { PortfolioStore } from '../services/portfolio-store.service';
import { UiPreferences } from '../services/ui-preferences.service';
import { operationPreview } from './portfolio';
import { DialogComponent } from './dialog.component';
import { MoneyPipe } from './money.pipe';

@Component({
  selector: 'crt-operation',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogComponent, MoneyPipe],
  templateUrl: './operation-drawer.component.html',
})
export class OperationDrawer implements OnChanges, OnDestroy {
  @Input() open = false;
  @Input() position?: Carteira;
  @Input() initialStock: number | null = null;
  @Input() initialType = 'COMPRA';
  @Output() dismissed = new EventEmitter<void>();
  @Output() completed = new EventEmitter<void>();
  type = 'COMPRA';
  brokerId: number | null = null;
  stockId: number | null = null;
  quantity: number | null = null;
  price: number | null = null;
  readonly busy = signal(false);
  readonly error = signal('');
  review = false;
  private request?: Subscription;
  constructor(
    public store: PortfolioStore,
    private api: CarteiraService,
    private ui: UiPreferences,
  ) {}
  ngOnChanges(): void {
    if (!this.open) return;
    this.type = this.initialType;
    this.stockId = this.position?.acao?.id || this.initialStock;
    this.brokerId =
      this.position?.corretora?.id ||
      this.store.brokers().find((broker) => broker.acoes.some((stock) => stock.id === this.stockId))
        ?.id ||
      null;
    this.quantity = null;
    this.review = false;
    this.error.set('');
    this.stockChanged();
  }
  ngOnDestroy(): void {
    this.request?.unsubscribe();
  }
  get availableStocks() {
    return this.store.brokers().find((broker) => broker.id === Number(this.brokerId))?.acoes || [];
  }
  get stock() {
    return this.availableStocks.find((stock) => stock.id === Number(this.stockId));
  }
  get holding() {
    return this.store
      .positions()
      .find(
        (position) =>
          position.acao?.id === Number(this.stockId) &&
          position.corretora?.id === Number(this.brokerId),
      );
  }
  get currency(): string {
    return this.stock?.moeda || 'BRL';
  }
  get preview() {
    try {
      return operationPreview(this.holding, {
        type: this.type,
        quantity: Number(this.quantity),
        price: Number(this.price),
      });
    } catch {
      return null;
    }
  }
  brokerChanged(): void {
    this.stockId = null;
    this.price = null;
    this.review = false;
  }
  stockChanged(): void {
    this.price = this.stock?.cotacaoAtual || null;
    this.review = false;
  }
  prepareReview(): void {
    this.error.set('');
    if (!this.brokerId || !this.stock || !this.quantity || !this.price) {
      this.error.set('Selecione corretora, ativo, quantidade e preço.');
      return;
    }
    if (Math.abs(this.price * 100 - Math.round(this.price * 100)) > 0.000001) {
      this.error.set('Informe o preço com até duas casas decimais.');
      return;
    }
    try {
      operationPreview(this.holding, {
        type: this.type,
        quantity: this.quantity,
        price: this.price,
      });
      this.review = true;
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Confira os dados da operação.');
    }
  }
  submit(): void {
    if (this.busy() || !this.review || !this.preview || !this.stock) return;
    this.busy.set(true);
    this.error.set('');
    this.request = this.api
      .operar({
        corretoraId: Number(this.brokerId),
        acaoId: this.stock.id,
        tipo: this.type,
        quantidade: Number(this.quantity),
        precoUnitario: Number(this.price),
      })
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.ui.notify('Operação confirmada. Sua carteira foi atualizada.');
          this.completed.emit();
        },
        error: (error) => {
          this.busy.set(false);
          this.error.set(
            error?.error?.message ||
              'Não foi possível confirmar. Consulte sua carteira antes de tentar novamente.',
          );
        },
      });
  }
}
