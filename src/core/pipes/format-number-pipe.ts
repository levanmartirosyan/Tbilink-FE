import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber',
})
export class FormatNumberPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '';

    if (value < 1000) {
      return value.toString();
    }

    if (value < 1_000_000) {
      return value.toLocaleString();
    }

    if (value < 1_000_000_000) {
      return (value / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }

    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
}
