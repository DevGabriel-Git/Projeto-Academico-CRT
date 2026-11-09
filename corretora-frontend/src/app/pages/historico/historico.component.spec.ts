import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HistoricoComponent } from './historico.component';
import { PortfolioStore } from '../../services/portfolio-store.service';
import { Movement } from '../../shared/portfolio';

describe('historico interativo', () => {
  const movements: Movement[] = [
    {
      id: 1,
      tipo: 'COMPRA',
      ticker: 'TEST',
      broker: 'Corretora A',
      currency: 'BRL',
      quantidade: 1,
      precoUnitario: 10,
      valorTotal: 10,
      dataOperacao: '2026-01-15T12:00:00',
    },
    {
      id: 2,
      tipo: 'VENDA',
      ticker: 'TEST',
      broker: 'Corretora A',
      currency: 'USD',
      quantidade: 1,
      precoUnitario: 30,
      valorTotal: 30,
      dataOperacao: '2026-01-20T12:00:00',
    },
  ];
  function setup(failure = '') {
    TestBed.configureTestingModule({
      imports: [HistoricoComponent],
      providers: [
        {
          provide: PortfolioStore,
          useValue: {
            loadWithHistory: vi.fn(),
            movements: signal(failure ? [] : movements),
            loading: signal(false),
            historyLoading: signal(false),
            error: signal(''),
            historyError: signal(failure),
          },
        },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
      ],
    });
    return TestBed.createComponent(HistoricoComponent);
  }
  it('filtra moeda, tipo e datas sem somar reais a dolares', () => {
    const component = setup().componentInstance;
    expect(component.buys).toBe(10);
    expect(component.sales).toBe(0);
    component.currency = 'USD';
    component.type = 'VENDA';
    expect(component.sales).toBe(30);
    component.from = '2026-01-21';
    expect(component.filtered).toEqual([]);
    component.from = '2026-02-01';
    component.to = '2026-01-01';
    expect(component.invalidRange).toBe(true);
  });
  it('erro de historico nao se apresenta como ausencia de operacoes', () => {
    const fixture = setup('Histórico indisponível.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Histórico indisponível');
    expect(fixture.nativeElement.textContent).not.toContain('Nenhum movimento por aqui');
    expect(fixture.nativeElement.textContent).toContain('Indisponível');
  });
});
