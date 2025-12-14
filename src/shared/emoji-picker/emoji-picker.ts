import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ThemeService } from '../../core/services/theme-service';

@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './emoji-picker.html',
  styleUrl: './emoji-picker.scss',
})
export class EmojiPickerComponent {
  @Input() isOpen = false;
  @Output() emojiSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  constructor(public themeService: ThemeService) {}

  get isDarkMode(): boolean {
    return this.themeService.getCurrentTheme() === 'dark';
  }

  onEmojiSelect(event: any): void {
    const emoji = event.emoji?.native || event.emoji;
    this.emojiSelected.emit(emoji);
  }

  onContainerClick(event: Event): void {
    event.stopPropagation();
  }

  onOverlayClick(): void {
    this.close.emit();
  }
}
