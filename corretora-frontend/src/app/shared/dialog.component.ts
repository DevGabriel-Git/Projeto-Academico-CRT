import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'crt-dialog',
  standalone: true,
  imports: [IconComponent],
  template: `
    <dialog
      #element
      [class.drawer]="drawer"
      [attr.aria-labelledby]="titleId"
      (cancel)="cancel($event)"
      (click)="backdrop($event)"
    >
      <header class="dialog-heading">
        <div>
          <p class="eyebrow">CRT · Investimentos</p>
          <h2 [id]="titleId">{{ title }}</h2>
        </div>
        <button
          type="button"
          class="icon-button"
          aria-label="Fechar painel"
          [disabled]="busy"
          (click)="dismissed.emit()"
        >
          <crt-icon name="close" />
        </button>
      </header>
      <ng-content />
    </dialog>
  `,
})
export class DialogComponent implements OnChanges, AfterViewInit {
  @Input() open = false;
  @Input() title = '';
  @Input() drawer = false;
  @Input() busy = false;
  @Output() dismissed = new EventEmitter<void>();
  @ViewChild('element', { static: true }) element?: ElementRef<HTMLDialogElement>;
  private static counter = 0;
  readonly titleId = `dialog-title-${DialogComponent.counter++}`;
  ngOnChanges(): void {
    this.sync();
  }
  ngAfterViewInit(): void {
    this.sync();
  }
  cancel(event: Event): void {
    event.preventDefault();
    if (!this.busy) this.dismissed.emit();
  }
  backdrop(event: MouseEvent): void {
    const dialog = this.element?.nativeElement;
    if (!dialog || event.target !== dialog || this.busy) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      this.dismissed.emit();
  }
  private sync(): void {
    const dialog = this.element?.nativeElement;
    if (!dialog) return;
    if (this.open && !dialog.open) dialog.showModal();
    if (!this.open && dialog.open) dialog.close();
  }
}
