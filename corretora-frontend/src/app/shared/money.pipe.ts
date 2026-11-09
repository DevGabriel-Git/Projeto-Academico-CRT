import { Pipe, PipeTransform } from '@angular/core';
import { UiPreferences } from '../services/ui-preferences.service';

@Pipe({ name: 'money', standalone: true, pure: false })
export class MoneyPipe implements PipeTransform {
  constructor(private preferences: UiPreferences) {}
  transform(value: number | null | undefined, currency = 'BRL'): string {
    if (this.preferences.privateValues()) return '••••••';
    if (value === null || value === undefined || !Number.isFinite(value)) return 'Indisponível';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
  }
}
