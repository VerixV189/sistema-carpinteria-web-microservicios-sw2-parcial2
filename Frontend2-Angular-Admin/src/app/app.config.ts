import { ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ApolloClientOptions, ApolloLink, InMemoryCache, Observable } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { AuthService } from './auth.service';
import { OfflineAiService } from './offline-ai.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Base fija /admin/: en standalone coincide con el <base> del index.html;
    // embebido en el portal (document.base='/') el provider manda igual.
    { provide: APP_BASE_HREF, useValue: '/admin/' },
    provideRouter(routes),
    provideHttpClient(),
    provideApollo((): ApolloClientOptions<unknown> => {
      const httpLink = inject(HttpLink);
      const auth = inject(AuthService);
      const offlineAi = inject(OfflineAiService);

      // JWT del gateway → business-service (auditoría: sin token = 401)
      const authLink = setContext(() => {
        const token = auth.token();
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      });

      // Interceptor Offline-First: sincroniza en localStorage cuando hay red
      // y responde desde la base local si se corta el internet o se fuerza Modo Offline.
      const offlineInterceptor = new ApolloLink((operation, forward) => {
        if (offlineAi.offline()) {
          return new Observable((observer) => {
            const data = offlineAi.resolveGraphQLOffline(operation.operationName, operation.variables);
            observer.next({ data });
            observer.complete();
          });
        }

        return new Observable((observer) => {
          const sub = forward(operation).subscribe({
            next: (result) => {
              offlineAi.markNetworkSuccess();
              offlineAi.syncFromGraphQLResponse(result.data as Record<string, any>);
              observer.next(result);
            },
            error: () => {
              offlineAi.markNetworkFailure();
              const data = offlineAi.resolveGraphQLOffline(operation.operationName, operation.variables);
              observer.next({ data });
              observer.complete();
            },
            complete: () => observer.complete(),
          });
          return () => sub.unsubscribe();
        });
      });

      return {
        link: ApolloLink.from([authLink, offlineInterceptor, httpLink.create({ uri: environment.graphqlUrl })]),
        cache: new InMemoryCache({ addTypename: false }),
      };
    }),
  ],
};
