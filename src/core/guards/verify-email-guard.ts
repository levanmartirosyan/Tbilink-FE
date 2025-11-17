import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { map, take } from 'rxjs';

export const verifyEmailGuard: CanActivateFn = (route, state) => {
  const commonService = inject(CommonService);
  const router = inject(Router);

  return commonService.userEmailExists$.pipe(
    take(1),
    map((exists) => {
      if (!exists) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
