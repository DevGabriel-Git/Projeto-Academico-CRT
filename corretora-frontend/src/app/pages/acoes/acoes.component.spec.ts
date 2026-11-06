import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { AcaoService } from '../../services/acao.service';
import { PortfolioStore } from '../../services/portfolio-store.service';
import { AcoesComponent } from './acoes.component';

describe('catalogo de ativos', () => {
  it('preserva exploracao do catalogo e preenche o cadastro com o mercado escolhido', () => {
    const register = vi.fn(() => of({ id: 1 }));
    TestBed.configureTestingModule({
      imports: [AcoesComponent],
      providers: [
        {
          provide: PortfolioStore,
          useValue: { load: vi.fn(), stocks: signal([]), brokers: signal([]) },
        },
        {
          provide: AcaoService,
          useValue: {
            listarDisponiveis: () =>
              of([
                { ticker: 'PETR4', mercado: 'BR' },
                { ticker: 'AAPL', mercado: 'EUA' },
              ]),
            cadastrar: register,
          },
        },
      ],
    });
    const component = TestBed.createComponent(AcoesComponent).componentInstance;
    component.explore();
    component.market = 'EUA';
    expect(component.catalogItems).toEqual([{ ticker: 'AAPL', mercado: 'EUA' }]);
    component.chooseTicker(component.catalogItems[0]);
    component.brokerCnpj = '10000000000100';
    component.save();
    expect(register).toHaveBeenCalledWith('AAPL', 'EUA', '10000000000100');
    expect(component.catalogOpen).toBe(false);
  });
});
