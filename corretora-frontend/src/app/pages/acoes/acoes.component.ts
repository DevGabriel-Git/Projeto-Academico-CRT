import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AcaoService } from '../../services/acao.service';
import { CorretoraService } from '../../services/corretora.service';
import { Acao, Corretora } from '../../models/models';

@Component({
  selector: 'app-acoes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="flex flex-col h-full overflow-hidden">
      <div class="px-6 py-4 border-b border-orange-500 dark:border-[#1e2330] flex items-center justify-between bg-white dark:bg-[#0a0b0e]">
        <div>
          <h1 class="text-black dark:text-white font-semibold text-base">Ações</h1>
          <p class="text-slate-600 text-xs mt-0.5">Mercado BR e EUA</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex bg-slate-50 dark:bg-[#0d0f14] rounded-lg p-1 border border-orange-500 dark:border-[#1e2330]">
            <button (click)="activeTab = 'cadastradas'" 
                    [class]="activeTab === 'cadastradas' ? 'bg-orange-100 dark:bg-[#1a1f2e] text-black dark:text-white' : 'text-slate-400 hover:text-slate-800 dark:text-slate-200'"
                    class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
              Cadastradas
            </button>
            <button (click)="activeTab = 'disponiveis'"
                    [class]="activeTab === 'disponiveis' ? 'bg-orange-100 dark:bg-[#1a1f2e] text-black dark:text-white' : 'text-slate-400 hover:text-slate-800 dark:text-slate-200'"
                    class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors">
              Disponíveis
            </button>
          </div>
          <button (click)="showModal = true"
                  class="bg-[#00d4aa] text-black text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-[#00bfa0] transition-colors">
            <i class="ti ti-plus"></i> Nova Ação
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6" *ngIf="activeTab === 'cadastradas'">
        <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-orange-500 dark:border-[#1e2330]">
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">Ticker</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">Empresa</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">Mercado</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">Cotação</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">Atualizado</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="6" class="text-center text-slate-600 py-8 text-xs">Carregando...</td>
              </tr>
              <tr *ngIf="!loading && acoes.length === 0">
                <td colspan="6" class="text-center text-slate-600 py-8 text-xs">Nenhuma ação cadastrada.</td>
              </tr>
              <tr *ngFor="let a of acoes" class="border-b border-orange-200 dark:border-[#1a1f2e] hover:bg-orange-50 dark:hover:bg-[#0f1117] transition-colors">
                <td class="px-4 py-3 font-mono font-bold text-black dark:text-white">{{ a.ticker }}</td>
                <td class="px-4 py-3 text-slate-300">{{ a.nomeEmpresa }}</td>
                <td class="px-4 py-3">
                  <span [class]="a.mercado === 'BR'
                    ? 'text-[10px] px-2 py-1 rounded-full font-semibold bg-[#0a2e1e] text-[#00d4aa]'
                    : 'text-[10px] px-2 py-1 rounded-full font-semibold bg-[#0a1e2e] text-[#0099ff]'">
                    {{ a.mercado }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium font-mono">
                  {{ a.moeda === 'BRL' ? 'R$' : '$' }} {{ a.cotacaoAtual | number:'1.2-2' }}
                </td>
                <td class="px-4 py-3 text-slate-600 text-xs">
                  {{ a.dataHoraCotacao | date:'dd/MM/yy HH:mm' }}
                </td>
                <td class="px-4 py-3 text-right flex items-center gap-3 justify-end">
                  <a routerLink="/carteira" [queryParams]="{acaoId: a.id}"
                     class="bg-[#00d4aa] text-black hover:bg-[#00bfa0] px-3 py-1 rounded text-[10px] font-bold transition-colors">
                    COMPRAR
                  </a>
                  <button (click)="atualizarCotacao(a)"
                          class="text-slate-600 hover:text-[#00d4aa] transition-colors text-sm" title="Atualizar cotação">
                    <i class="ti ti-refresh"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6" *ngIf="activeTab === 'disponiveis'">
        <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl overflow-hidden p-4">
          <h2 class="text-black dark:text-white font-semibold mb-4">Catálogo de Ações</h2>
          <div *ngIf="loadingDisponiveis" class="text-slate-600 text-xs">Carregando ações disponíveis...</div>
          <div *ngIf="!loadingDisponiveis && acoesDisponiveis.length === 0" class="text-slate-600 text-xs">Nenhuma ação encontrada.</div>
          
          <div *ngIf="!loadingDisponiveis && acoesDisponiveis.length > 0" class="max-h-[60vh] overflow-y-auto pr-2">
             <h3 class="text-sm text-slate-500 uppercase tracking-widest mb-3 mt-2">Mercado Americano (EUA)</h3>
             <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
               <div *ngFor="let acao of acoesEUA" 
                    (click)="abrirModalNovaAcao(acao.ticker, 'EUA')"
                    class="cursor-pointer bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg p-3 flex flex-col items-center justify-center hover:bg-orange-50 dark:hover:bg-[#0f1117] hover:border-[#00d4aa] transition-colors">
                  <span class="font-mono font-bold text-black dark:text-white text-sm">{{ acao.ticker }}</span>
               </div>
             </div>

             <h3 class="text-sm text-slate-500 uppercase tracking-widest mb-3 mt-4">Mercado Brasileiro (B3)</h3>
             <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
               <div *ngFor="let acao of acoesBR" 
                    (click)="abrirModalNovaAcao(acao.ticker, 'BR')"
                    class="cursor-pointer bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg p-3 flex flex-col items-center justify-center hover:bg-orange-50 dark:hover:bg-[#0f1117] hover:border-[#00d4aa] transition-colors">
                  <span class="font-mono font-bold text-black dark:text-white text-sm">{{ acao.ticker }}</span>
               </div>
             </div>
          </div>
        </div>
      </div>

    <!-- Modal -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-2xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-black dark:text-white font-semibold">Nova Ação</h2>
          <button (click)="fecharModal()" class="text-slate-600 hover:text-slate-300">
            <i class="ti ti-x text-lg"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Ticker</label>
            <input [(ngModel)]="ticker" type="text" list="acoesDisponiveisList" placeholder="ex: PETR4 ou AAPL"
                   class="w-full bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-[#00d4aa] focus:outline-none transition-colors font-mono uppercase" />
            <datalist id="acoesDisponiveisList">
              <option *ngFor="let acao of acoesDisponiveis" [value]="acao.ticker"></option>
            </datalist>
          </div>

          <div>
            <label class="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Mercado</label>
            <select [(ngModel)]="mercado"
                    class="w-full bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-[#00d4aa] focus:outline-none transition-colors">
              <option value="BR">BR — Bolsa brasileira (B3)</option>
              <option value="EUA">EUA — NYSE / NASDAQ</option>
            </select>
          </div>

          <div>
            <label class="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">Corretora</label>
            <select [(ngModel)]="corretoraId"
                    class="w-full bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-[#00d4aa] focus:outline-none transition-colors">
              <option value="">Selecione uma corretora</option>
              <option *ngFor="let c of corretoras" [value]="c.cnpj">{{ c.nomeFantasia || c.razaoSocial }}</option>
            </select>
          </div>

          <div *ngIf="erro" class="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2 text-red-400 text-xs">{{ erro }}</div>
          <div *ngIf="sucesso" class="bg-[#0a2e1e] border border-[#00d4aa]/30 rounded-lg px-3 py-2 text-[#00d4aa] text-xs">Ação cadastrada com sucesso!</div>
        </div>

        <div class="flex gap-3 mt-6">
          <button (click)="fecharModal()" class="flex-1 border border-orange-500 dark:border-[#1e2330] text-slate-400 rounded-lg py-2.5 text-sm hover:bg-orange-100 dark:bg-[#1a1f2e] transition-colors">Cancelar</button>
          <button (click)="cadastrar()" [disabled]="salvando"
                  class="flex-1 bg-[#00d4aa] text-black font-bold rounded-lg py-2.5 text-sm hover:bg-[#00bfa0] transition-colors disabled:opacity-50">
            {{ salvando ? 'Buscando cotação...' : 'Cadastrar' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AcoesComponent implements OnInit {
  acoes: Acao[] = [];
  corretoras: Corretora[] = [];
  acoesDisponiveis: {ticker: string, mercado: string}[] = [];
  loading = true;
  loadingDisponiveis = false;
  activeTab = 'cadastradas'; // 'cadastradas' | 'disponiveis'
  showModal = false;
  ticker = '';
  mercado = 'BR';
  corretoraId = '';
  salvando = false;
  erro = '';
  sucesso = false;

  get acoesBR() { return this.acoesDisponiveis.filter(a => a.mercado === 'BR'); }
  get acoesEUA() { return this.acoesDisponiveis.filter(a => a.mercado === 'EUA'); }

  constructor(private acaoService: AcaoService, private corretoraService: CorretoraService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
  this.carregar();
  this.carregarDisponiveis();
  this.corretoraService.listar().subscribe({ 
    next: (d: any) => { 
      this.corretoras = d; 
      this.cdr.detectChanges();
    }, 
    error: () => {} 
  });
}

carregarDisponiveis() {
  this.loadingDisponiveis = true;
  this.acaoService.listarDisponiveis().subscribe({
    next: (d: any[]) => {
      this.acoesDisponiveis = d;
      this.loadingDisponiveis = false;
      this.cdr.detectChanges();
    },
    error: () => {
      this.loadingDisponiveis = false;
      this.cdr.detectChanges();
    }
  });
}

carregar() {
  this.loading = true;
  this.acaoService.listar().subscribe({
    next: (d: any) => { 
      this.acoes = d; 
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: () => { 
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  cadastrar() {
    if (!this.ticker.trim() || !this.corretoraId) { this.erro = 'Preencha todos os campos.'; return; }
    this.salvando = true;
    this.erro = '';
    this.acaoService.cadastrar(this.ticker.trim().toUpperCase(), this.mercado, this.corretoraId).subscribe({
      next: () => {
        this.sucesso = true;
        this.salvando = false;
        this.carregar();
        setTimeout(() => this.fecharModal(), 1500);
      },
      error: (e) => { this.erro = e?.error?.message || 'Erro ao cadastrar.'; this.salvando = false; }
    });
  }

  atualizarCotacao(a: Acao) {
    this.acaoService.atualizarCotacao(a.id).subscribe({
      next: updated => {
        const idx = this.acoes.findIndex(x => x.id === a.id);
        if (idx >= 0) this.acoes[idx] = updated;
      },
      error: (e) => alert(e?.error?.message || 'Erro ao atualizar.')
    });
  }

  fecharModal() {
    this.showModal = false;
    this.ticker = '';
    this.mercado = 'BR';
    this.corretoraId = '';
    this.erro = '';
    this.sucesso = false;
    this.salvando = false;
  }

  abrirModalNovaAcao(ticker: string, mercado: string = 'BR') {
    this.ticker = ticker;
    this.mercado = mercado;
    this.showModal = true;
  }
}
