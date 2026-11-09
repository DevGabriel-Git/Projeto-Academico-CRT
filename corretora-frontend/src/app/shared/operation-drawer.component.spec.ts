import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { OperationDrawer } from './operation-drawer.component';
import { PortfolioStore } from '../services/portfolio-store.service';
import { CarteiraService } from '../services/carteira.service';
import { Carteira, Corretora, Acao } from '../models/models';

describe('operacao com revisao', () => {
  const asset = { id: 1, ticker: 'TEST', moeda: 'BRL', cotacaoAtual: 20 } as Acao;
  const holding = {
    id: 1,
    quantidade: 10,
    precoMedio: 10,
    acao: asset,
    corretora: { id: 1 },
  } as Carteira;
  let post: ReturnType<typeof vi.fn>;
  let response: Subject<Carteira>;
  beforeEach(() => {
    response = new Subject<Carteira>();
    post = vi.fn(() => response);
    TestBed.configureTestingModule({
      imports: [OperationDrawer],
      providers: [
        { provide: CarteiraService, useValue: { operar: post } },
        {
          provide: PortfolioStore,
          useValue: {
            brokers: signal([{ id: 1, acoes: [asset] }] as Corretora[]),
            positions: signal([holding]),
          },
        },
      ],
    });
  });
  function operation() {
    const component = TestBed.createComponent(OperationDrawer).componentInstance;
    component.open = true;
    component.position = holding;
    component.ngOnChanges();
    return component;
  }
  it('revisa saldo e custo antes de enviar, com apenas um POST pendente', () => {
    const component = operation();
    component.quantity = 10;
    component.submit();
    expect(post).not.toHaveBeenCalled();
    component.prepareReview();
    expect(component.preview).toEqual({ quantity: 20, average: 15, total: 200 });
    component.submit();
    component.submit();
    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith({
      corretoraId: 1,
      acaoId: 1,
      tipo: 'COMPRA',
      quantidade: 10,
      precoUnitario: 20,
    });
    response.next(holding);
    expect(component.busy()).toBe(false);
  });
  it('rejeita venda sem saldo, fracionamento de unidades e preco com tres casas', () => {
    const component = operation();
    component.type = 'VENDA';
    component.quantity = 11;
    component.prepareReview();
    expect(component.error()).toContain('saldo');
    component.type = 'COMPRA';
    component.quantity = 1.5;
    component.prepareReview();
    expect(component.review).toBe(false);
    component.quantity = 1;
    component.price = 0.001;
    component.prepareReview();
    expect(component.error()).toContain('duas casas');
    expect(post).not.toHaveBeenCalled();
  });
  it('preserva dados e informa erro sem repetir o envio automaticamente', () => {
    const component = operation();
    component.quantity = 1;
    component.prepareReview();
    component.submit();
    response.error({ error: { message: 'Saldo alterado. Consulte sua carteira.' } });
    expect(component.busy()).toBe(false);
    expect(component.error()).toContain('Saldo alterado');
    expect(post).toHaveBeenCalledTimes(1);
  });
});
