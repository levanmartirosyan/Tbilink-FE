import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { map, take } from 'rxjs';

export const createPasswordGuard: CanActivateFn = (route, state) => {
  const commonService = inject(CommonService);
  const router = inject(Router);

  return commonService.isEmailVerified$.pipe(
    take(1),
    map((isVerified) => {
      if (!isVerified) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
