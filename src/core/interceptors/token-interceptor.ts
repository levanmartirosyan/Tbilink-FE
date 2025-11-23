import { HttpInterceptorFn } from '@angular/common/http';
import { UserService } from '../services/user-service';
import { inject } from '@angular/core';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);

  const token =
    typeof window !== 'undefined'
      ? userService.getUser()?.tokens.accessToken
      : null;

  const auth = token
    ? req.clone({
        headers: req.headers
          .set('Authorization', `Bearer ${token}`)
          .append('Accept', 'application/json'),
      })
    : req;

  return next(auth);
};
