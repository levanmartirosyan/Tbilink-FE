import { inject } from '@angular/core';
import { CanDeactivateFn, Router } from '@angular/router';
import { CommonService } from '../services/common-service';
import { map, take } from 'rxjs';

export const verifyEmailDeactivateGuard: CanDeactivateFn<unknown> = (
  component,
  currentRoute,
  currentState,
  nextState
) => {
  const commonService = inject(CommonService);
  const router = inject(Router);

  return commonService.userEmailExists$.pipe(
    take(1),
    map((exists) => {
      if (exists) {
        router.navigate(['/auth/verify-email']);
        return false;
      }
      return true;
    })
  );
};
