import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Corretora } from '../../models/models';
import { PortfolioStore } from '../../services/portfolio-store.service';
import { CorretoraService } from '../../services/corretora.service';
import { UiPreferences } from '../../services/ui-preferences.service';
import { IconComponent } from '../../shared/icon.component';
import { DialogComponent } from '../../shared/dialog.component';

@Component({
  selector: 'app-corretoras',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, IconComponent, DialogComponent],
  templateUrl: './corretoras.component.html',
})
export class CorretorasComponent implements OnInit, OnDestroy {
  query = '';
  status = '';
  modal = false;
  cnpj = '';
  deleting: Corretora | null = null;
  readonly saving = signal(false);
  readonly error = signal('');
  private requests = new Subscription();
  constructor(
    public store: PortfolioStore,
    private api: CorretoraService,
    public ui: UiPreferences,
  ) {}
  ngOnInit(): void {
    this.store.load();
  }
  ngOnDestroy(): void {
    this.requests.unsubscribe();
  }
  get brokers() {
    const term = this.query.toLowerCase().replace(/[.\/-]/g, '');
    return this.store
      .brokers()
      .filter(
        (broker) =>
          `${broker.nomeFantasia} ${broker.razaoSocial} ${broker.cnpj}`
            .toLowerCase()
            .includes(term) &&
          (!this.status || broker.validadaNaCvm === (this.status === 'validated')),
      );
  }
  openCreate(): void {
    this.error.set('');
    this.cnpj = '';
    this.modal = true;
  }
  save(): void {
    if (this.saving()) return;
    const cnpj = this.cnpj.replace(/\D/g, '');
    if (cnpj.length !== 14) {
      this.error.set('Informe um CNPJ com 14 dígitos.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.requests.add(
      this.api.cadastrar(cnpj).subscribe({
        next: () => {
          this.saving.set(false);
          this.modal = false;
          this.ui.notify('Corretora adicionada ao seu portfólio.');
          this.store.load();
        },
        error: (error) => {
          this.saving.set(false);
          this.error.set(
            error?.error?.message || 'Não foi possível consultar o CNPJ. Tente novamente.',
          );
        },
      }),
    );
  }
  confirmDelete(broker: Corretora): void {
    this.error.set('');
    this.deleting = broker;
  }
  remove(): void {
    if (!this.deleting || this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    this.requests.add(
      this.api.deletar(this.deleting.id).subscribe({
        next: () => {
          this.saving.set(false);
          this.deleting = null;
          this.ui.notify('Corretora removida.');
          this.store.load();
        },
        error: () => {
          this.saving.set(false);
          this.error.set(
            'Não foi possível remover. A corretora pode estar vinculada a posições ou operações.',
          );
        },
      }),
    );
  }
}
