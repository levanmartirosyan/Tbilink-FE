import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';
import { inject } from '@angular/core';

export const authAdminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const currentUser = userService.getUser()?.data.role;
  if (currentUser !== 'Admin' && currentUser !== 'Owner') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
