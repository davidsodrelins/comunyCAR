import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SendAlertComponent } from './components/send-alert/send-alert.component';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { CreditsComponent } from './components/credits/credits.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'send-alert',
    component: SendAlertComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'vehicles',
    component: VehiclesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'credits',
    component: CreditsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
