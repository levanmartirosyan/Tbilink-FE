import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';

export const authGuard: CanActivateFn = (route, state) => {
  const user = inject(UserService);
  const router = inject(Router);

  const currentUser = user.getUser();

  const isExpired = currentUser?.expiresAt
    ? new Date(currentUser.expiresAt).getTime() < Date.now()
    : true;

  if (!currentUser?.accessToken || isExpired) {
    router.navigate(['/auth/signin']);
    return false;
  }

  return true;
};
