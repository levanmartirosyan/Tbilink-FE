import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { UserService } from '../services/user-service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: any) => {
      if (err && err.status === 401) {
        userService.logout();
        router.navigate(['/']);
      }
      return throwError(() => err);
    })
  );
};
