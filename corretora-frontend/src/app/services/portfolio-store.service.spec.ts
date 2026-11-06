import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Carteira } from '../models/models';
import { CarteiraService } from './carteira.service';
import { AcaoService } from './acao.service';
import { CorretoraService } from './corretora.service';
import { PortfolioStore } from './portfolio-store.service';

describe('PortfolioStore', () => {
  it('nao consulta historico em telas que precisam apenas das posicoes', () => {
    const history = vi.fn(() => of([]));
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CarteiraService,
          useValue: { listar: () => of([{ id: 1 }] as Carteira[]), listarHistorico: history },
        },
        { provide: AcaoService, useValue: { listar: () => of([]) } },
        { provide: CorretoraService, useValue: { listar: () => of([]) } },
      ],
    });
    const store = TestBed.inject(PortfolioStore);
    store.load();
    expect(store.positions().length).toBe(1);
    expect(history).not.toHaveBeenCalled();
  });
  it('torna erro parcial de historico explicito e nao mistura moedas', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CarteiraService,
          useValue: {
            listar: () => of([{ id: 1 }, { id: 2, acao: { moeda: 'USD' } }] as Carteira[]),
            listarHistorico: (id: number) =>
              id === 1
                ? of([{ id: 1, dataOperacao: '2026-11-06', valorTotal: 10 }])
                : throwError(() => new Error('offline')),
          },
        },
        { provide: AcaoService, useValue: { listar: () => of([]) } },
        { provide: CorretoraService, useValue: { listar: () => of([]) } },
      ],
    });
    const store = TestBed.inject(PortfolioStore);
    store.loadWithHistory();
    expect(store.historyError()).toContain('incompletos');
    expect(store.movements().length).toBe(1);
    store.clear();
    expect(store.movements()).toEqual([]);
    expect(store.positions()).toEqual([]);
  });
  it('mostra falha de carregamento e limpa dados anteriores', () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CarteiraService,
          useValue: { listar: () => throwError(() => new Error('offline')) },
        },
        { provide: AcaoService, useValue: { listar: () => of([]) } },
        { provide: CorretoraService, useValue: { listar: () => of([]) } },
      ],
    });
    const store = TestBed.inject(PortfolioStore);
    store.loadWithHistory();
    expect(store.error()).toContain('Não foi possível');
    expect(store.loading()).toBe(false);
  });
});
