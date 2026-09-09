import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CorretoraService } from '../../services/corretora.service';
import { AcaoService } from '../../services/acao.service';
import { CarteiraService } from '../../services/carteira.service';
import { Corretora, Acao, Carteira } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex flex-col h-full overflow-hidden">
      <!-- Topbar -->
      <div class="px-6 py-4 border-b border-orange-500 dark:border-[#1e2330] flex items-center justify-between bg-white dark:bg-[#0a0b0e]">
        <div>
          <h1 class="text-black dark:text-white font-semibold text-base">Dashboard</h1>
          <p class="text-slate-600 text-xs mt-0.5">Visão geral do sistema</p>
        </div>
        <a routerLink="/carteira"
           class="bg-[#00d4aa] text-black text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-[#00bfa0] transition-colors">
          <i class="ti ti-plus"></i> Nova operação
        </a>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Métricas -->
        <div class="grid grid-cols-4 gap-3">
          <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl p-4">
            <p class="text-[11px] text-slate-600 uppercase tracking-widest mb-2">Corretoras</p>
            <p class="text-2xl font-bold text-black dark:text-white">{{ corretoras.length }}</p>
            <p class="text-[11px] text-[#00d4aa] mt-1">cadastradas</p>
          </div>
          <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl p-4">
            <p class="text-[11px] text-slate-600 uppercase tracking-widest mb-2">Ações</p>
            <p class="text-2xl font-bold text-black dark:text-white">{{ acoes.length }}</p>
            <p class="text-[11px] text-[#00d4aa] mt-1">cadastradas</p>
          </div>
          <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl p-4">
            <p class="text-[11px] text-slate-600 uppercase tracking-widest mb-2">Carteiras</p>
            <p class="text-2xl font-bold text-black dark:text-white">{{ carteiras.length }}</p>
            <p class="text-[11px] text-[#00d4aa] mt-1">ativas</p>
          </div>
          <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl p-4">
            <p class="text-[11px] text-slate-600 uppercase tracking-widest mb-2">Validadas CVM</p>
            <p class="text-2xl font-bold text-black dark:text-white">{{ corretorasValidadas }}</p>
            <p class="text-[11px] text-[#00d4aa] mt-1">corretoras</p>
          </div>
        </div>

        <!-- Corretoras + Ações -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Corretoras -->
          <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl p-4 flex flex-col max-h-[300px]">
            <div class="flex items-center justify-between mb-4">
              <p class="text-[11px] text-slate-500 uppercase tracking-widest">Corretoras</p>
              <a routerLink="/corretoras" class="text-[11px] text-[#00d4aa] hover:underline">Ver todas →</a>
            </div>
            <div *ngIf="loading" class="text-slate-600 text-xs">Carregando...</div>
            <div class="overflow-y-auto pr-2 flex-1">
              <div *ngFor="let c of corretoras"
                   class="flex items-center justify-between py-2.5 border-b border-orange-200 dark:border-[#1a1f2e] last:border-0">
                <div>
                  <p class="text-sm text-slate-800 dark:text-slate-200 font-medium">{{ c.nomeFantasia || c.razaoSocial }}</p>
                  <p class="text-[11px] text-slate-600 mt-0.5">{{ c.cidade }} - {{ c.uf }}</p>
                </div>
                <span [class]="c.validadaNaCvm
                  ? 'text-[10px] px-2 py-1 rounded-full font-semibold bg-[#0a2e1e] text-[#00d4aa]'
                  : 'text-[10px] px-2 py-1 rounded-full font-semibold bg-[#2e1a0a] text-amber-400'">
                  {{ c.validadaNaCvm ? 'Validada' : 'Pendente' }}
                </span>
              </div>
            </div>
            <div *ngIf="corretoras.length === 0 && !loading" class="text-slate-600 text-xs py-2">
              Nenhuma corretora cadastrada.
            </div>
          </div>

          <!-- Ações -->
          <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl p-4 flex flex-col max-h-[300px]">
            <div class="flex items-center justify-between mb-4">
              <p class="text-[11px] text-slate-500 uppercase tracking-widest">Ações</p>
              <a routerLink="/acoes" class="text-[11px] text-[#00d4aa] hover:underline">Ver todas →</a>
            </div>
            <div *ngIf="loading" class="text-slate-600 text-xs">Carregando...</div>
            <div class="overflow-y-auto pr-2 flex-1">
              <div *ngFor="let a of acoes"
                   class="flex items-center justify-between py-2.5 border-b border-orange-200 dark:border-[#1a1f2e] last:border-0">
                <div>
                  <p class="text-sm text-black dark:text-white font-bold font-mono">{{ a.ticker }}</p>
                  <p class="text-[11px] text-slate-600 mt-0.5">{{ a.nomeEmpresa }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-slate-800 dark:text-slate-200 font-medium">
                    {{ a.moeda === 'BRL' ? 'R$' : '$' }} {{ a.cotacaoAtual | number:'1.2-2' }}
                  </p>
                  <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        [class]="a.mercado === 'BR' ? 'bg-[#0a2e1e] text-[#00d4aa]' : 'bg-[#0a1e2e] text-[#0099ff]'">
                    {{ a.mercado }}
                  </span>
                </div>
              </div>
            </div>
            <div *ngIf="acoes.length === 0 && !loading" class="text-slate-600 text-xs py-2">
              Nenhuma ação cadastrada.
            </div>
          </div>
        </div>

        <!-- Carteiras recentes -->
        <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl p-4 flex flex-col max-h-[300px]">
          <div class="flex items-center justify-between mb-4">
            <p class="text-[11px] text-slate-500 uppercase tracking-widest">Carteiras Recentes</p>
            <a routerLink="/carteira" class="text-[11px] text-[#00d4aa] hover:underline">Ver todas →</a>
          </div>
          <div *ngIf="carteiras.length === 0 && !loading" class="text-slate-600 text-xs py-2">
            Nenhuma carteira encontrada. Faça uma operação de compra para começar.
          </div>
          <div class="overflow-y-auto pr-2 flex-1">
            <div class="grid grid-cols-3 gap-3">
              <div *ngFor="let cart of carteiras"
                   class="bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg p-3">
                <p class="text-xs font-bold font-mono text-black dark:text-white">{{ cart.acao?.ticker || 'N/A' }}</p>
                <p class="text-[11px] text-slate-600 mt-0.5 mb-2">{{ cart.acao?.nomeEmpresa }}</p>
                <p class="text-sm font-semibold text-[#00d4aa]">{{ cart.quantidade }} cotas</p>
                <p class="text-[11px] text-slate-500">Preço médio: R$ {{ cart.precoMedio | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  corretoras: Corretora[] = [];
  acoes: Acao[] = [];
  carteiras: Carteira[] = [];
  loading = true;

  get corretorasValidadas() {
    return this.corretoras.filter(c => c.validadaNaCvm).length;
  }

  constructor(
    private corretoraService: CorretoraService,
    private acaoService: AcaoService,
    private carteiraService: CarteiraService,
    private cdr: ChangeDetectorRef
  ) {}

ngOnInit() {
  this.loading = true;
  this.corretoraService.listar().subscribe({ 
    next: (d: any) => { this.corretoras = d; this.loading = false; this.cdr.detectChanges(); }, 
    error: () => { this.loading = false; this.cdr.detectChanges(); } 
  });
  this.acaoService.listar().subscribe({ 
    next: (d: any) => { this.acoes = d; this.cdr.detectChanges(); }, 
    error: () => {} 
  });
  this.carteiraService.listar().subscribe({ 
    next: (d: any) => { this.carteiras = d; this.cdr.detectChanges(); }, 
    error: () => {} 
  });
}
}
