import { Carteira, HistoricoCarteira } from '../models/models';

export type Currency = 'BRL' | 'USD';
export interface Movement extends HistoricoCarteira {
  ticker: string;
  currency: string;
  broker: string;
}
export const currencyOf = (position: Carteira): string =>
  position.acao?.moeda || (position.acao?.mercado === 'EUA' ? 'USD' : 'BRL');
export const brokerName = (position: Carteira): string =>
  position.corretora?.nomeFantasia || position.corretora?.razaoSocial || 'Sem corretora';
const round = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;
export const validQuote = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

function cents(value: number): bigint {
  const [coefficient, exponent = '0'] = value.toString().toLowerCase().split('e');
  const fraction = coefficient.split('.')[1]?.length || 0;
  const digits = BigInt(coefficient.replace('.', ''));
  const scale = fraction - Number(exponent);
  if (scale <= 2) return digits * 10n ** BigInt(2 - scale);
  const divisor = 10n ** BigInt(scale - 2);
  return (digits + divisor / 2n) / divisor;
}

export function summary(positions: Carteira[], currency: Currency) {
  const selected = positions.filter(
    (position) => currencyOf(position) === currency && position.quantidade > 0,
  );
  const cost = round(
    selected.reduce((sum, position) => sum + position.quantidade * position.precoMedio, 0),
  );
  const missing = selected.filter((position) => !validQuote(position.acao?.cotacaoAtual)).length;
  const current = missing
    ? null
    : round(
        selected.reduce(
          (sum, position) => sum + position.quantidade * position.acao!.cotacaoAtual,
          0,
        ),
      );
  const result = current === null ? null : round(current - cost);
  return {
    cost,
    current,
    result,
    missing,
    count: selected.length,
    percent: result === null || cost === 0 ? null : round((result / cost) * 100),
  };
}

export function allocation(positions: Carteira[], currency: Currency, group: 'asset' | 'broker') {
  const groups = new Map<string, number>();
  positions
    .filter((position) => currencyOf(position) === currency && position.quantidade > 0)
    .forEach((position) => {
      const name = group === 'asset' ? position.acao?.ticker || 'Sem ticker' : brokerName(position);
      groups.set(name, (groups.get(name) || 0) + position.quantidade * position.precoMedio);
    });
  const total = [...groups.values()].reduce((sum, value) => sum + value, 0);
  return [...groups]
    .map(([name, value]) => ({ name, value, percent: total ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);
}

export function operationPreview(
  position: Carteira | undefined,
  operation: { type: string; quantity: number; price: number },
) {
  const { type, quantity, price } = operation;
  if (!Number.isSafeInteger(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0)
    throw new Error('Quantidade e preço devem ser positivos.');
  const previous = position?.quantidade || 0;
  if (type === 'VENDA' && quantity > previous)
    throw new Error('Quantidade maior que o saldo disponível.');
  const next = type === 'COMPRA' ? previous + quantity : previous - quantity;
  if (!Number.isSafeInteger(next)) throw new Error('Quantidade acima do limite de apresentação.');
  const total = cents(price) * BigInt(quantity);
  // Integer cents keep HALF_UP consistent with BigDecimal, including 10.075 -> 10.08.
  const numerator = BigInt(previous) * cents(position?.precoMedio || 0) + total;
  const average =
    type === 'COMPRA'
      ? Number((numerator + BigInt(next) / 2n) / BigInt(next)) / 100
      : position?.precoMedio || 0;
  if (total > BigInt(Number.MAX_SAFE_INTEGER))
    throw new Error('Valor acima do limite de apresentação.');
  return { quantity: next, average, total: Number(total) / 100 };
}

export function csv(rows: (string | number)[][]): string {
  return (
    '\uFEFF' +
    rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value);
            if (/^[\s]*[=+@-]/.test(text) && typeof value !== 'number') text = "'" + text;
            return '"' + text.replace(/"/g, '""') + '"';
          })
          .join(';'),
      )
      .join('\r\n')
  );
}

export function downloadCsv(rows: (string | number)[][], name: string): void {
  const url = URL.createObjectURL(new Blob([csv(rows)], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
