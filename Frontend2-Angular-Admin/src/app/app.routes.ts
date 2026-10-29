import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ClientsComponent } from './clients/clients.component';
import { CarpentersComponent } from './carpenters/carpenters.component';
import { OrdersComponent } from './orders/orders.component';
import { DeliveriesComponent } from './deliveries/deliveries.component';
import { QuotationsComponent } from './quotations/quotations.component';
import { MarketplaceComponent } from './marketplace/marketplace.component';
import { ReportsComponent } from './reports/reports.component';
import { LoginComponent } from './login.component';
import { adminGuard } from './auth.guard';

// Rutas sin prefijo: la base '/admin/' la aporta APP_BASE_HREF
// (standalone :4202/admin/* y embebido :4200/admin/* resuelven igual).
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'clientes', component: ClientsComponent, canActivate: [adminGuard] },
  { path: 'carpinteros', component: CarpentersComponent, canActivate: [adminGuard] },
  { path: 'pedidos', component: OrdersComponent, canActivate: [adminGuard] },
  { path: 'entregas', component: DeliveriesComponent, canActivate: [adminGuard] },
  { path: 'cotizaciones', component: QuotationsComponent, canActivate: [adminGuard] },
  { path: 'marketplace', component: MarketplaceComponent, canActivate: [adminGuard] },
  { path: 'reportes', component: ReportsComponent, canActivate: [adminGuard] },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' },
];
