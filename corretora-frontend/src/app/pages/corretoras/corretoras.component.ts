import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CorretoraService } from '../../services/corretora.service';
import { Corretora } from '../../models/models';


@Component({
  selector: 'app-corretoras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col h-full overflow-hidden">
      <!-- Topbar -->
      <div class="px-6 py-4 border-b border-orange-500 dark:border-[#1e2330] flex items-center justify-between bg-white dark:bg-[#0a0b0e]">
        <div>
          <h1 class="text-black dark:text-white font-semibold text-base">Corretoras</h1>
          <p class="text-slate-600 text-xs mt-0.5">Gerencie as corretoras cadastradas</p>
        </div>
        <button (click)="showModal = true"
                class="bg-[#00d4aa] text-black text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-[#00bfa0] transition-colors">
          <i class="ti ti-plus"></i> Nova Corretora
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <!-- Tabela -->
        <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl overflow-hidden">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-orange-500 dark:border-[#1e2330]">
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">Empresa</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">CNPJ</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">Cidade</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">CVM</th>
                <th class="text-left text-[11px] text-slate-600 uppercase tracking-widest px-4 py-3">Ações</th>
                <th class="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading">
                <td colspan="6" class="text-center text-slate-600 py-8 text-xs">Carregando...</td>
              </tr>
              <tr *ngIf="!loading && corretoras.length === 0">
                <td colspan="6" class="text-center text-slate-600 py-8 text-xs">Nenhuma corretora cadastrada.</td>
              </tr>
              <tr *ngFor="let c of corretoras"
                  class="border-b border-orange-200 dark:border-[#1a1f2e] hover:bg-orange-50 dark:hover:bg-[#0f1117] transition-colors">
                <td class="px-4 py-3">
                  <p class="text-slate-800 dark:text-slate-200 font-medium">{{ c.nomeFantasia || c.razaoSocial }}</p>
                  <p class="text-[11px] text-slate-600 mt-0.5">{{ c.razaoSocial }}</p>
                </td>
                <td class="px-4 py-3 font-mono text-slate-400 text-xs">{{ c.cnpj }}</td>
                <td class="px-4 py-3 text-slate-400 text-xs">{{ c.cidade }} - {{ c.uf }}</td>
                <td class="px-4 py-3">
                  <span [class]="c.validadaNaCvm
                    ? 'text-[10px] px-2 py-1 rounded-full font-semibold bg-[#0a2e1e] text-[#00d4aa]'
                    : 'text-[10px] px-2 py-1 rounded-full font-semibold bg-[#2e1a0a] text-amber-400'">
                    {{ c.validadaNaCvm ? 'Validada' : 'Pendente' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-500 text-xs">{{ c.acoes?.length || 0 }} ações</td>
                <td class="px-4 py-3 text-right">
                  <button (click)="confirmarDelete(c)"
                          class="text-slate-600 hover:text-red-400 transition-colors text-sm">
                    <i class="ti ti-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal cadastrar -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-2xl p-6 w-full max-w-md">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-black dark:text-white font-semibold">Nova Corretora</h2>
          <button (click)="fecharModal()" class="text-slate-600 hover:text-slate-300">
            <i class="ti ti-x text-lg"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs text-slate-500 uppercase tracking-wider block mb-1.5">CNPJ</label>
            <input [(ngModel)]="cnpjInput" type="text" placeholder="00.000.000/0000-00"
                   class="w-full bg-white dark:bg-[#0a0b0e] border border-orange-500 dark:border-[#1e2330] rounded-lg px-3 py-2.5 text-slate-800 dark:text-slate-200 text-sm focus:border-[#00d4aa] focus:outline-none transition-colors font-mono" />
            <p class="text-[11px] text-slate-600 mt-1">Pode digitar com ou sem pontuação.</p>
          </div>

          <div *ngIf="erro" class="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2 text-red-400 text-xs">
            {{ erro }}
          </div>

          <div *ngIf="sucesso" class="bg-[#0a2e1e] border border-[#00d4aa]/30 rounded-lg px-3 py-2 text-[#00d4aa] text-xs">
            Corretora cadastrada com sucesso!
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button (click)="fecharModal()"
                  class="flex-1 border border-orange-500 dark:border-[#1e2330] text-slate-400 rounded-lg py-2.5 text-sm hover:bg-orange-100 dark:bg-[#1a1f2e] transition-colors">
            Cancelar
          </button>
          <button (click)="cadastrar()" [disabled]="salvando"
                  class="flex-1 bg-[#00d4aa] text-black font-bold rounded-lg py-2.5 text-sm hover:bg-[#00bfa0] transition-colors disabled:opacity-50">
            {{ salvando ? 'Buscando...' : 'Cadastrar' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class CorretorasComponent implements OnInit {
  corretoras: Corretora[] = [];
  loading = true;
  showModal = false;
  cnpjInput = '';
  salvando = false;
  erro = '';
  sucesso = false;

  constructor(
  private corretoraService: CorretoraService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit() {
    this.carregar();
  }

carregar() {
  this.loading = true;
  this.corretoraService.listar().subscribe({
    next: (d: any) => { 
      this.corretoras = d; 
      this.loading = false;
      this.cdr.detectChanges();
    },
    error: (e: any) => { 
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}

  cadastrar() {
    if (!this.cnpjInput.trim()) { this.erro = 'Informe o CNPJ.'; return; }
    
    const cnpjLimpo = this.cnpjInput.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) { this.erro = 'CNPJ deve conter 14 dígitos.'; return; }
    
    this.salvando = true;
    this.erro = '';
    this.corretoraService.cadastrar(cnpjLimpo).subscribe({
      next: () => {
        this.sucesso = true;
        this.salvando = false;
        this.cdr.detectChanges();
        this.carregar();
        setTimeout(() => { this.fecharModal(); this.cdr.detectChanges(); }, 1500);
      },
      error: (e) => {
        this.erro = e?.error?.message || 'Erro ao cadastrar.';
        this.salvando = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmarDelete(c: Corretora) {
    if (confirm(`Remover ${c.nomeFantasia || c.razaoSocial}?`)) {
      this.corretoraService.deletar(c.id).subscribe({
        next: () => this.carregar(),
        error: (e) => alert(e?.error?.message || 'Erro ao remover.')
      });
    }
  }

  fecharModal() {
    this.showModal = false;
    this.cnpjInput = '';
    this.erro = '';
    this.sucesso = false;
    this.salvando = false;
  }
}
