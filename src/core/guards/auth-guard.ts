import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';

export const authGuard: CanActivateFn = (route, state) => {
  const user = inject(UserService);
  const router = inject(Router);

  const currentUser = user.getUser();

  const isExpired = currentUser?.tokens.expiresAt
    ? new Date(currentUser.tokens.expiresAt).getTime() < Date.now()
    : true;

  const dataExists = currentUser && Object.keys(currentUser).length > 0;

  if (!currentUser?.tokens.accessToken || isExpired || !dataExists) {
    router.navigate(['/auth/signin']);
    return false;
  }

  return true;
};
