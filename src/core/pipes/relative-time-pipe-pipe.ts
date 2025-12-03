import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTimePipe',
})
export class RelativeTimePipePipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) {
      return 'just now';
    } else if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return `${mins} minute${mins > 1 ? 's' : ''} ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diff < 172800) {
      return 'yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }
}
