import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { CarteiraComponent } from './carteira.component';
import { PortfolioStore } from '../../services/portfolio-store.service';

describe('estado de consulta da carteira', () => {
  for (const error of ['', 'Consulta indisponível.']) {
    it(
      error
        ? 'nao apresenta patrimonio zero em erro'
        : 'nao apresenta patrimonio zero enquanto carrega',
      () => {
        TestBed.configureTestingModule({
          imports: [CarteiraComponent],
          providers: [
            provideRouter([]),
            provideHttpClient(),
            {
              provide: PortfolioStore,
              useValue: {
                load: vi.fn(),
                positions: signal([]),
                brokers: signal([]),
                loading: signal(!error),
                error: signal(error),
                updated: signal(null),
              },
            },
            {
              provide: ActivatedRoute,
              useValue: { snapshot: { queryParamMap: { get: () => null } } },
            },
          ],
        });
        const fixture = TestBed.createComponent(CarteiraComponent);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.metric-value')).toBeNull();
        if (error) expect(fixture.nativeElement.textContent).toContain(error);
      },
    );
  }
});
