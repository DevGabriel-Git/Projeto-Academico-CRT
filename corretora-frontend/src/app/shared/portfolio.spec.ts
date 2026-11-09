import { describe, it, expect } from 'vitest';
import { Carteira } from '../models/models';
import { summary, allocation, operationPreview, csv } from './portfolio';

const position = (currency: string, price: number | null = 12): Carteira => ({
  id: 1,
  quantidade: 10,
  precoMedio: 10,
  dataAtualizacao: '',
  acao: {
    id: 1,
    ticker: 'TEST',
    nomeEmpresa: 'Teste',
    mercado: currency === 'BRL' ? 'BR' : 'EUA',
    moeda: currency,
    cotacaoAtual: price as number,
    dataHoraCotacao: '',
  },
});

describe('calculos financeiros de apresentacao', () => {
  it('separa moedas e calcula resultado nao realizado', () => {
    const result = summary([position('BRL'), position('USD', 20)], 'BRL');
    expect(result.cost).toBe(100);
    expect(result.current).toBe(120);
    expect(result.result).toBe(20);
    expect(result.percent).toBe(20);
  });
  it('nao inventa valor de mercado quando falta cotacao', () => {
    const result = summary([position('BRL', null)], 'BRL');
    expect(result.current).toBeNull();
    expect(result.result).toBeNull();
    expect(result.missing).toBe(1);
  });
  it('posicoes zeradas nao produzem divisao por zero', () => {
    const result = summary([], 'USD');
    expect(result.cost).toBe(0);
    expect(result.percent).toBeNull();
  });
  it('distribui pelo custo e ignora posicoes sem saldo', () => {
    const empty = { ...position('BRL'), quantidade: 0 };
    expect(allocation([position('BRL'), empty], 'BRL', 'asset')[0].percent).toBe(100);
  });
  it('previa de compra usa media ponderada e venda preserva media', () => {
    expect(operationPreview(position('BRL'), { type: 'COMPRA', quantity: 10, price: 20 })).toEqual({
      quantity: 20,
      average: 15,
      total: 200,
    });
    expect(operationPreview(position('BRL'), { type: 'VENDA', quantity: 4, price: 15 })).toEqual({
      quantity: 6,
      average: 10,
      total: 60,
    });
    expect(() =>
      operationPreview(position('BRL'), { type: 'VENDA', quantity: 11, price: 15 }),
    ).toThrow();
  });
  it('media em meio centavo segue HALF_UP do servidor', () => {
    const holding = { ...position('BRL'), quantidade: 1, precoMedio: 10.07 };
    expect(operationPreview(holding, { type: 'COMPRA', quantity: 1, price: 10.08 }).average).toBe(
      10.08,
    );
  });
  it('CSV escapa aspas, delimitadores e formulas', () => {
    const result = csv([
      ['Ativo', 'Total'],
      ['=HYPERLINK("x")', '12;34'],
    ]);
    expect(result).toContain('"\'=HYPERLINK(""x"")"');
    expect(result).toContain('"12;34"');
  });
});
