import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  protected readonly toast = toast;

  private duration = 3000;

  success(message: string, duration?: number) {
    this.toast.success(message, {
      duration: duration || this.duration,
    });
  }

  error(message: string, duration?: number) {
    this.toast.error(message, {
      duration: duration || this.duration,
    });
  }

  info(message: string, duration?: number) {
    this.toast.info(message, {
      duration: duration || this.duration,
    });
  }

  warning(message: string, duration?: number) {
    this.toast.warning(message, {
      duration: duration || this.duration,
    });
  }

  loading(message: string, duration?: number) {
    this.toast.loading(message, {
      duration: duration || this.duration,
    });
  }

  dismiss(id?: number | string) {
    this.toast.dismiss(id);
  }
}
