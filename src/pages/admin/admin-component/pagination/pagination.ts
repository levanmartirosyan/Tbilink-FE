import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-pagination',
  imports: [LucideAngularModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination {
  @Input() pageNumber: number = 1;
  @Input() totalPages: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  go(page: any) {
    const p = typeof page === 'number' ? page : Number(page);
    if (!Number.isInteger(p)) return;
    if (p < 1 || p > this.totalPages) return;
    this.pageChange.emit(p);
  }

  getPageItems(): Array<number | string> {
    const total = this.totalPages || 1;
    const current = this.pageNumber || 1;
    const delta = 2;

    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const range: Array<number | string> = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    if (left > 2) range.push('...');
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push('...');
    range.push(total);

    return range;
  }
}
