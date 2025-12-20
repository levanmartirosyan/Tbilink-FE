import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.scss',
})
export class CustomSelectComponent implements OnInit {
  @Input() options: string[] = [];
  @Input() selectedValue: string = '';
  @Input() placeholder: string = 'Select an option';
  @Input() disableSearch: boolean = false;
  @Output() selectionChanged = new EventEmitter<string>();

  isOpen = false;
  filteredOptions: string[] = [];
  searchText = '';

  ngOnInit() {
    this.filteredOptions = this.options;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.filteredOptions = this.options;
      this.searchText = '';
    }
  }

  selectOption(option: string): void {
    this.selectedValue = option;
    this.selectionChanged.emit(option);
    this.isOpen = false;
    this.searchText = '';
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.filteredOptions = this.options.filter((option) =>
      option.toLowerCase().includes(value.toLowerCase())
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select-container')) {
      this.isOpen = false;
    }
  }

  getDisplayValue(): string {
    return this.selectedValue || this.placeholder;
  }
}
