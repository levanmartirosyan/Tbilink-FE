import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { SignalRService } from '../services/signal-r-service';

export const banInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const cookieService = inject(CookieService);
  const signalRService = inject(SignalRService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403 && error.error?.message === 'User is banned.') {
        try {
          cookieService.delete('TB-UserData', '/');
        } catch {}

        try {
          localStorage.removeItem('TB-UnreadCounts');
        } catch {}

        try {
          signalRService.stopHubConnection();
        } catch {}

        router.navigate(['/']);
      }

      return throwError(() => error);
    })
  );
};
