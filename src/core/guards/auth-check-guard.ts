import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';

export const authCheckGuard: CanActivateFn = (route, state) => {
  const user = inject(UserService);
  const router = inject(Router);

  const currentUser = user.getUser();

  const isExpired = currentUser?.tokens.expiresAt
    ? new Date(currentUser.tokens.expiresAt).getTime() < Date.now()
    : true;

  if (currentUser?.tokens.accessToken && !isExpired) {
    router.navigate(['/feed']);
    return false;
  }

  return true;
};
