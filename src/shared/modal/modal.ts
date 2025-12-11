import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Overlay } from '../overlay/overlay';

@Component({
  selector: 'app-modal',
  imports: [CommonModule, LucideAngularModule, Overlay],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() isOpen: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() submitButtonText: string = 'Save';
  @Input() submitDisabled: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSubmit = new EventEmitter<void>();

  closeModal(): void {
    this.onClose.emit();
  }

  toggleModal = (): void => {
    this.closeModal();
  };

  handleSubmit(): void {
    this.onSubmit.emit();
  }
}
