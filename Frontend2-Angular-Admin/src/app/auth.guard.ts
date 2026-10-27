import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Solo ADMIN puede entrar al panel; sin sesión o rol distinto → /login. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  auth.acceptHandoff();
  const s = auth.session();
  if (s && s.role === 'ADMIN') return true;
  auth.logout();
  return router.parseUrl('/login');
};
