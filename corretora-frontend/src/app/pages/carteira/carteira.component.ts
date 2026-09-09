import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarteiraService } from '../../services/carteira.service';
import { CorretoraService } from '../../services/corretora.service';
import { AcaoService } from '../../services/acao.service';
import { Carteira, Corretora, Acao, HistoricoCarteira } from '../../models/models';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full overflow-hidden">
      <div class="px-6 py-4 border-b border-orange-500 dark:border-[#1e2330] flex items-center justify-between bg-white dark:bg-[#0a0b0e]">
        <div>
          <h1 class="text-black dark:text-white font-semibold text-base">Carteira</h1>
          <p class="text-slate-600 text-xs mt-0.5">Compre e venda ações</p>
        </div>
        <button (click)="novaOperacao()"
                class="bg-[#00d4aa] text-black text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-[#00bfa0] transition-colors">
          <i class="ti ti-arrows-exchange"></i> Nova Operação
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- Cards de carteira -->
        <div *ngIf="loading" class="text-slate-600 text-xs text-center py-8">Carregando...</div>
        <div *ngIf="!loading && carteiras.length === 0" class="text-center py-12">
          <i class="ti ti-wallet text-slate-700 text-4xl block mb-3"></i>
          <p class="text-slate-600 text-sm">Nenhuma posição em carteira.</p>
          <p class="text-slate-700 text-xs mt-1">Faça uma operação de compra para começar.</p>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div *ngFor="let c of carteiras"
               class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl p-4 hover:border-[#2a3040] transition-colors cursor-pointer"
               (click)="verHistorico(c)">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="font-mono font-bold text-black dark:text-white text-sm">{{ c.acao?.ticker }}</p>
                <p class="text-[11px] text-slate-600 mt-0.5">{{ c.acao?.nomeEmpresa }}</p>
              </div>
              <span [class]="c.acao?.mercado === 'BR'
                ? 'text-[10px] px-2 py-0.5 rounded-full bg-[#0a2e1e] text-[#00d4aa] font-semibold'
                : 'text-[10px] px-2 py-0.5 rounded-full bg-[#0a1e2e] text-[#0099ff] font-semibold'">
                {{ c.acao?.mercado }}
              </span>
            </div>
            <div class="space-y-1">
              <div class="flex justify-between">
                <span class="text-[11px] text-slate-600">Quantidade</span>
                <span class="text-[11px] text-slate-800 dark:text-slate-300 font-semibold">{{ c.quantidade }} cotas</span>
              </div>
              <div class="flex justify-between">
                <span class="text-[11px] text-slate-600">Preço médio</span>
                <span class="text-[11px] text-slate-800 dark:text-slate-300 font-semibold">R$ {{ c.precoMedio | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between border-t border-orange-500/20 dark:border-[#1e2330] mt-2 pt-2">
                <span class="text-[11px] text-slate-600">Valor Investido</span>
                <span class="text-[11px] text-[#00d4aa] font-bold">
                  R$ {{ (c.quantidade * c.precoMedio) | number:'1.2-2' }}
                </span>
              </div>
            </div>
            
            <div class="mt-4 pt-3 border-t border-orange-500 dark:border-[#1e2330] flex gap-2">
              <button (click)="prepararOperacao(c, 'COMPRA'); $event.stopPropagation()" 
                      class="flex-1 bg-[#0a2e1e] hover:bg-[#00d4aa] text-[#00d4aa] hover:text-black text-[10px] font-bold py-1.5 rounded transition-colors">
                COMPRAR
              </button>
              <button (click)="prepararOperacao(c, 'VENDA'); $event.stopPropagation()"
                      class="flex-1 bg-[#2e0a0a] hover:bg-red-500 text-red-400 hover:text-white text-[10px] font-bold py-1.5 rounded transition-colors">
                VENDER
              </button>
            </div>
          </div>
        </div>

        <!-- Histórico -->
        <div *ngIf="historicoSelecionado.length > 0" class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl p-4">
          <div class="flex items-center justify-between mb-4">
            <p class="text-[11px] text-slate-500 uppercase tracking-widest">Histórico de operações</p>
            <button (click)="historicoSelecionado = []" class="text-slate-600 hover:text-slate-300 text-xs">Fechar</button>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-orange-500 dark:border-[#1e2330]">
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-2 py-2">Tipo</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-2 py-2">Qtd</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-2 py-2">Preço</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-2 py-2">Total</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-2 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let h of historicoSelecionado" class="border-b border-[#1a1f2e]">
                <td class="px-2 py-2">
                  <span [class]="h.tipo === 'COMPRA'
                    ? 'text-[10px] px-2 py-0.5 rounded-full bg-[#0a2e1e] text-[#00d4aa] font-bold'
                    : 'text-[10px] px-2 py-0.5 rounded-full bg-[#2e0a0a] text-red-400 font-bold'">
                    {{ h.tipo }}
                  </span>
                </td>
                <td class="px-2 py-2 text-slate-300 text-xs">{{ h.quantidade }}</td>
                <td class="px-2 py-2 text-slate-300 text-xs font-mono">R$ {{ h.precoUnitario | number:'1.2-2' }}</td>
                <td class="px-2 py-2 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold">R$ {{ h.valorTotal | number:'1.2-2' }}</td>
                <td class="px-2 py-2 text-slate-600 text-xs">{{ h.dataOperacao | date:'dd/MM/yy HH:mm' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Footer Resumo -->
        <div *ngIf="carteiras.length > 0" class="mt-8 bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <p class="text-xs text-slate-500 uppercase tracking-widest mb-1">Total Investido (Custo)</p>
            <p class="text-2xl font-bold text-black dark:text-white font-mono">R$ {{ getTotalInvestido() | number:'1.2-2' }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-slate-500 uppercase tracking-widest mb-1">Valor Atual (Se Vendido)</p>
            <p class="text-2xl font-bold font-mono" [class]="getValorAtualTotal() >= getTotalInvestido() ? 'text-[#00d4aa]' : 'text-red-400'">
              R$ {{ getValorAtualTotal() | number:'1.2-2' }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-xs text-slate-500 uppercase tracking-widest mb-1">Média por Ativo</p>
            <p class="text-lg font-semibold text-slate-400 font-mono">R$ {{ getMediaPorAtivo() | number:'1.2-2' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal operação -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-2xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-black dark:text-white font-semibold">Nova Operação</h2>
          <button (click)="fecharModal()" class="text-slate-600 hover:text-slate-300">
            <i class="ti ti-x text-lg"></i>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Tipo -->
          <div class="grid grid-cols-2 gap-2">
            <button (click)="tipo = 'COMPRA'"
                    [class]="tipo === 'COMPRA'
                      ? 'py-2.5 rounded-lg text-sm font-bold bg-[#0a2e1e] text-[#00d4aa] border border-[#00d4aa]/40'
                      : 'py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-[#0a0b0e] text-slate-500 border border-orange-500 dark:border-[#1e2330] hover:bg-orange-100 dark:bg-[#1a1f2e]'">
              <i class="ti ti-trending-up mr-1"></i> Compra
            </button>
            <button (click)="tipo = 'VENDA'"
                    [class]="tipo === 'VENDA'
                      ? 'py-2.5 rounded-lg text-sm font-bold bg-[#2e0a0a] text-red-400 border border-red-800/40'
                      : 'py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-[#0a0b0e] text-slate-500 border border-orange-500 dark:border-[#1e2330] hover:bg-orange-100 dark:bg-[#1a1f2e]'">
              <i class="ti ti-trending-down mr-1"></i> Venda
            </button>
          </div>

          <div>
            <label class="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Corretora</label>
            <select [(ngModel)]="corretoraId" [disabled]="isPreSelecionado"
                    class="w-full bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-[#00d4aa] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
              <option value="">Selecione</option>
              <option *ngFor="let c of corretoras" [value]="c.id">{{ c.nomeFantasia || c.razaoSocial }}</option>
            </select>
          </div>

          <div>
            <label class="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Ação</label>
            <select [(ngModel)]="acaoId" [disabled]="isPreSelecionado"
                    (ngModelChange)="onAcaoChange()" class="w-full bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-[#00d4aa] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed">
              <option value="">Selecione</option>
              <option *ngFor="let a of acoes" [value]="a.id">{{ a.ticker }} — {{ a.nomeEmpresa }}</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
  <div>
    <label class="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Quantidade</label>
    <input [(ngModel)]="quantidade" type="number" min="1" placeholder="0"
           class="w-full bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-[#00d4aa] focus:outline-none font-mono" />
  </div>
  <div>
  <label class="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Preço unitário</label>
  <input [(ngModel)]="precoUnitario" type="number" step="0.01"
         class="w-full bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-[#00d4aa] focus:outline-none font-mono" />
  <p class="text-[11px] text-slate-600 mt-1">Sugerido: cotação atual, mas você pode alterar.</p>
</div>
</div>

          <div *ngIf="quantidade && precoUnitario" class="bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg px-3 py-2 flex justify-between">
            <span class="text-xs text-slate-600">Total da operação</span>
            <span class="text-sm font-bold text-[#00d4aa] font-mono">R$ {{ (quantidade * precoUnitario) | number:'1.2-2' }}</span>
          </div>

          <div *ngIf="erro" class="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2 text-red-400 text-xs">{{ erro }}</div>
          <div *ngIf="sucesso" class="bg-[#0a2e1e] border border-[#00d4aa]/30 rounded-lg px-3 py-2 text-[#00d4aa] text-xs">Operação realizada com sucesso!</div>
        </div>

        <div class="flex gap-3 mt-6">
          <button (click)="fecharModal()" class="flex-1 border border-orange-500 dark:border-[#1e2330] text-slate-400 rounded-lg py-2.5 text-sm hover:bg-orange-100 dark:bg-[#1a1f2e] transition-colors">Cancelar</button>
          <button (click)="operar()" [disabled]="salvando"
                  [class]="tipo === 'COMPRA'
                    ? 'flex-1 bg-[#00d4aa] text-black font-bold rounded-lg py-2.5 text-sm hover:bg-[#00bfa0] transition-colors disabled:opacity-50'
                    : 'flex-1 bg-red-500 text-black dark:text-white font-bold rounded-lg py-2.5 text-sm hover:bg-red-600 transition-colors disabled:opacity-50'">
            {{ salvando ? 'Processando...' : (tipo === 'COMPRA' ? 'Comprar' : 'Vender') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class CarteiraComponent implements OnInit {
  carteiras: Carteira[] = [];
  corretoras: Corretora[] = [];
  acoes: Acao[] = [];
  historicoSelecionado: HistoricoCarteira[] = [];
  loading = true;
  showModal = false;
  tipo = 'COMPRA';
  corretoraId: any = '';
  acaoId: any = '';
  isPreSelecionado = false;
  quantidade: any = null;
  precoUnitario: any = null;
  salvando = false;
  erro = '';
  sucesso = false;

  constructor(
    private carteiraService: CarteiraService,
    private corretoraService: CorretoraService,
    private acaoService: AcaoService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.carregar();
    this.corretoraService.listar().subscribe({ 
      next: (d: any) => { this.corretoras = d; this.cdr.detectChanges(); }, 
      error: () => {} 
    });
    this.acaoService.listar().subscribe({ 
      next: (d: any) => { 
        this.acoes = d; 
        
        // Check for query params to open modal
        this.route.queryParams.subscribe(params => {
          if (params['acaoId']) {
            this.acaoId = String(params['acaoId']);
            this.tipo = 'COMPRA';
            this.showModal = true;
            this.onAcaoChange();
            this.cdr.detectChanges();
          }
        });
        
        this.cdr.detectChanges(); 
      }, 
      error: () => {} 
    });
  }

carregar() {
  this.loading = true;
  this.carteiraService.listar().subscribe({
    next: (d: any) => { this.carteiras = d; this.loading = false; this.cdr.detectChanges(); },
    error: () => { this.loading = false; this.cdr.detectChanges(); }
  });
}

  verHistorico(c: Carteira) {
    this.carteiraService.listarHistorico(c.id).subscribe({
      next: h => {
        this.historicoSelecionado = h;
        this.cdr.detectChanges();
      },
      error: () => alert('Erro ao carregar histórico.')
    });
  }

  prepararOperacao(c: Carteira, tipoOp: string) {
    this.tipo = tipoOp;
    this.corretoraId = c.corretora?.id ? String(c.corretora.id) : '';
    this.acaoId = c.acao?.id ? String(c.acao.id) : '';
    this.isPreSelecionado = true;
    this.quantidade = null;
    this.precoUnitario = c.acao?.cotacaoAtual || this.getCotacaoAtual();
    this.showModal = true;
    this.cdr.detectChanges();
  }

  operar() {
    if (!this.corretoraId || !this.acaoId || !this.quantidade || !this.precoUnitario) {
      this.erro = 'Preencha todos os campos.'; 
      return;
    }
    this.salvando = true;
    this.erro = '';
    this.carteiraService.operar({
      corretoraId: +this.corretoraId,
      acaoId: +this.acaoId,
      tipo: this.tipo,
      quantidade: +this.quantidade,
      precoUnitario: this.precoUnitario ? +this.precoUnitario : 0
    }).subscribe({
      next: () => {
        this.sucesso = true;
        this.salvando = false;
        this.cdr.detectChanges();
        this.carregar();
        setTimeout(() => { this.fecharModal(); this.cdr.detectChanges(); }, 1500);
      },
      error: (e: any) => { 
        this.erro = e?.error?.message || 'Erro na operação.'; 
        this.salvando = false; 
        this.cdr.detectChanges();
      }
    });
  }

  get acaoSelecionada(): Acao | undefined {
    return this.acoes.find(a => String(a.id) === String(this.acaoId));
  }

getCotacaoAtual(): number {
  return this.acaoSelecionada?.cotacaoAtual || 0;
}

  onAcaoChange() {
    if (this.acaoSelecionada) {
      this.precoUnitario = this.acaoSelecionada.cotacaoAtual;
    }
  }

  getTotalInvestido(): number {
    return this.carteiras.reduce((acc, c) => acc + (c.quantidade * c.precoMedio), 0);
  }

  getValorAtualTotal(): number {
    return this.carteiras.reduce((acc, c) => {
      const cotacao = c.acao?.cotacaoAtual || 0;
      return acc + (c.quantidade * cotacao);
    }, 0);
  }

  getMediaPorAtivo(): number {
    if (this.carteiras.length === 0) return 0;
    return this.getTotalInvestido() / this.carteiras.length;
  }

  novaOperacao() {
    this.fecharModal();
    this.showModal = true;
  }

  fecharModal() {
    this.showModal = false;
    this.isPreSelecionado = false;
    this.tipo = 'COMPRA';
    this.corretoraId = '';
    this.acaoId = '';
    this.quantidade = null;
    this.precoUnitario = null;
    this.erro = '';
    this.sucesso = false;
    this.salvando = false;
  }
}
