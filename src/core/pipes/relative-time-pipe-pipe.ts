import { Pipe, PipeTransform } from '@angular/core';

type Context = 'default' | 'chat';

@Pipe({
  name: 'relativeTimePipe',
})
export class RelativeTimePipe implements PipeTransform {
  transform(
    value: Date | string | number | null,
    context: Context = 'default'
  ): string {
    if (!value) return '';

    const date = new Date(value);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diffSeconds = (now.getTime() - date.getTime()) / 1000;

    const sameYear = date.getFullYear() === now.getFullYear();

    if (context === 'chat') {
      if (diffSeconds < 60) return 'now';
      if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
      if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
      if (diffSeconds < 172800) return 'yesterday';

      return sameYear ? this.shortDayMonth(date) : this.shortDayMonthYear(date);
    }

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) {
      const m = Math.floor(diffSeconds / 60);
      return `${m} minute${m > 1 ? 's' : ''} ago`;
    }
    if (diffSeconds < 86400) {
      const h = Math.floor(diffSeconds / 3600);
      return `${h} hour${h > 1 ? 's' : ''} ago`;
    }
    if (diffSeconds < 172800) {
      return `yesterday at ${this.formatTime(date)}`;
    }

    return sameYear
      ? `${this.longDayMonth(date)} at ${this.formatTime(date)}`
      : this.longDayMonthYear(date);
  }

  private shortDayMonth(date: Date): string {
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    });
  }

  private shortDayMonthYear(date: Date): string {
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  private longDayMonth(date: Date): string {
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
    });
  }

  private longDayMonthYear(date: Date): string {
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
