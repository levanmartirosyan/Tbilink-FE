import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';
import { inject } from '@angular/core';
import { ApiService } from '../services/api-service';
import { catchError, map, of } from 'rxjs';

export const authAdminGuard: CanActivateFn = (route, state) => {
  const api = inject(ApiService);
  const router = inject(Router);

  return api.isAdminUser().pipe(
    map((isAdmin: any) => {
      if (isAdmin.data) {
        return true;
      }

      router.navigate(['/']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/']);
      return of(false);
    })
  );
};
