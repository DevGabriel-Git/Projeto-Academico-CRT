import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CorretorasComponent } from './pages/corretoras/corretoras.component';
import { AcoesComponent } from './pages/acoes/acoes.component';
import { CarteiraComponent } from './pages/carteira/carteira.component';
import { HistoricoComponent } from './pages/historico/historico.component';

import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'corretoras', component: CorretorasComponent, canActivate: [authGuard] },
  { path: 'acoes', component: AcoesComponent, canActivate: [authGuard] },
  { path: 'carteira', component: CarteiraComponent, canActivate: [authGuard] },
  { path: 'historico', component: HistoricoComponent, canActivate: [authGuard] },
];
