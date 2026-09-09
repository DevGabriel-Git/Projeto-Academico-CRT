import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarteiraService } from '../../services/carteira.service';
import { Carteira, HistoricoCarteira } from '../../models/models';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full overflow-hidden">
      <div class="px-6 py-4 border-b border-orange-500 dark:border-[#1e2330] bg-white dark:bg-[#0a0b0e]">
        <h1 class="text-black dark:text-white font-semibold text-base">Histórico</h1>
        <p class="text-slate-600 text-xs mt-0.5">Todas as operações realizadas</p>
      </div>

      <div class="flex-1 overflow-y-auto p-6">
        <div *ngIf="loading" class="text-slate-600 text-xs text-center py-8">Carregando...</div>

        <div *ngFor="let c of carteiras" class="mb-4">
          <div class="bg-slate-50 dark:bg-[#0d0f14] border border-orange-500 dark:border-[#1e2330] rounded-xl overflow-hidden">
            <div class="px-4 py-3 border-b border-orange-500 dark:border-[#1e2330] flex items-center gap-2">
              <span class="font-mono font-bold text-black dark:text-white text-sm">{{ c.acao?.ticker }}</span>
              <span class="text-slate-600 text-xs">{{ c.acao?.nomeEmpresa }}</span>
              <span class="ml-auto text-[11px] text-slate-500">{{ c.quantidade }} cotas · PM R$ {{ c.precoMedio | number:'1.2-2' }}</span>
            </div>
            <table class="w-full text-sm">
              <tbody>
                <tr *ngFor="let h of historicos[c.id]" class="border-b border-orange-200 dark:border-[#1a1f2e] last:border-0 hover:bg-orange-50 dark:hover:bg-[#0f1117]">
                  <td class="px-4 py-2.5">
                    <span [class]="h.tipo === 'COMPRA'
                      ? 'text-[10px] px-2 py-0.5 rounded-full bg-[#0a2e1e] text-[#00d4aa] font-bold'
                      : 'text-[10px] px-2 py-0.5 rounded-full bg-[#2e0a0a] text-red-400 font-bold'">
                      {{ h.tipo }}
                    </span>
                  </td>
                  <td class="px-4 py-2.5 text-slate-400 text-xs">{{ h.quantidade }} cotas</td>
                  <td class="px-4 py-2.5 text-slate-400 text-xs font-mono">R$ {{ h.precoUnitario | number:'1.2-2' }}</td>
                  <td class="px-4 py-2.5 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold">R$ {{ h.valorTotal | number:'1.2-2' }}</td>
                  <td class="px-4 py-2.5 text-slate-600 text-xs">{{ h.dataOperacao | date:'dd/MM/yy HH:mm' }}</td>
                </tr>
                <tr *ngIf="!historicos[c.id] || historicos[c.id].length === 0">
                  <td colspan="5" class="px-4 py-3 text-slate-700 text-xs">Sem operações registradas.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div *ngIf="!loading && carteiras.length === 0" class="text-center py-12">
          <i class="ti ti-history text-slate-700 text-4xl block mb-3"></i>
          <p class="text-slate-600 text-sm">Nenhuma operação encontrada.</p>
        </div>
      </div>
    </div>
  `
})
export class HistoricoComponent implements OnInit {
  carteiras: Carteira[] = [];
  historicos: { [key: number]: HistoricoCarteira[] } = {};
  loading = true;

 constructor(
  private carteiraService: CarteiraService,
  private cdr: ChangeDetectorRef
) {}

  ngOnInit() {
    this.carteiraService.listar().subscribe({
      next: (carteiras: any) => {
        this.carteiras = carteiras;
        this.loading = false;
        this.cdr.detectChanges();
        carteiras.forEach((c: any) => {
          this.carteiraService.listarHistorico(c.id).subscribe({
            next: (h: any) => { 
              this.historicos[c.id] = h; 
              this.cdr.detectChanges();
            },
            error: () => {}
          });
        });
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });
  }
}
