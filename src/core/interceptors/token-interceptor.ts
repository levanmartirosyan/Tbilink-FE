import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;

  if (typeof window !== 'undefined') {
    // Read token directly from cookie to avoid circular dependency
    const userCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('TB-UserData='));

    if (userCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userCookie.split('=')[1])
        );
        token = userData?.tokens?.accessToken || null;
      } catch {
        token = null;
      }
    }
  }

  const auth = token
    ? req.clone({
        headers: req.headers
          .set('Authorization', `Bearer ${token}`)
          .append('Accept', 'application/json'),
      })
    : req;

  return next(auth);
};
