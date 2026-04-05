import { Routes } from '@angular/router';
import { DepartmentSelectComponent } from './features/step1/department-select.component';
import { AgentReportComponent } from './features/step2/agent-report.component';
import { ActionComponent } from './features/step3/action.component';
import { ChatComponent } from './features/chat/chat.component';
import { LoginComponent } from './features/login/login.component';
import { DashboardExecComponent } from './features/dashboard/dashboard-exec.component';
import { HistoricoComponent } from './features/historico/historico.component';
import { ConfiguracoesComponent } from './features/configuracoes/configuracoes.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', component: DepartmentSelectComponent },
      { path: 'dashboard', component: DashboardExecComponent },
      { path: 'relatorio/:id', component: AgentReportComponent },
      { path: 'acao/:id', component: ActionComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'historico', component: HistoricoComponent },
      { path: 'configuracoes', component: ConfiguracoesComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];
