import { Component, Input } from '@angular/core';

@Component({
  selector: 'crt-icon',
  standalone: true,
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path [attr.d]="icons[name] || icons['chart']" />
  </svg>`,
  styles: [
    ':host{display:inline-flex;width:20px;height:20px;flex-shrink:0}svg{width:100%;height:100%}',
  ],
})
export class IconComponent {
  @Input() name = 'chart';
  readonly icons: Record<string, string> = {
    dashboard: 'M3 3h7v8H3zM14 3h7v5h-7zM3 15h7v6H3zM14 12h7v9h-7z',
    wallet: 'M4 5h15v14H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h13M15 10h7v5h-7zM18 12.5h.01',
    building: 'M3 21h18M5 21V8h14v13M3 8l9-5 9 5M9 12v5M15 12v5',
    chart: 'M3 3v18h18M7 15l4-5 4 3 6-8',
    history: 'M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2',
    search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
    plus: 'M12 5v14M5 12h14',
    arrow: 'M5 12h14M14 7l5 5-5 5',
    chevron: 'M9 5l7 7-7 7',
    close: 'M6 6l12 12M6 18L18 6',
    sun: 'M12 3v1M12 20v1M3 12h1M20 12h1M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    moon: 'M20 14a8 8 0 0 1-10-10A9 9 0 1 0 20 14',
    menu: 'M4 6h16M4 12h16M4 18h16',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    download: 'M12 3v12M7 10l5 5 5-5M4 16v5h16v-5',
    star: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
    refresh: 'M20 7A9 9 0 0 0 4 6L2 9M2 3v6h6M4 17a9 9 0 0 0 16 1l2-3M16 15h6v6',
    logout: 'M9 4H4v16h5M10 12h12M17 7l5 5-5 5',
    shield: 'M12 2l8 4v6c0 5-8 10-8 10S4 17 4 12V6zM8 12l3 3 5-6',
    filter: 'M4 7h16M7 12h10M10 17h4',
    check: 'M4 12l5 5L20 6',
    monitor: 'M3 4h18v13H3zM8 21h8M12 17v4',
  };
}
