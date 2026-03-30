import { Routes } from '@angular/router';
import { DepartmentSelectComponent } from './features/step1/department-select.component';
import { AgentReportComponent } from './features/step2/agent-report.component';
import { ActionComponent } from './features/step3/action.component';
import { ChatComponent } from './features/chat/chat.component';

export const routes: Routes = [
  { path: '', component: DepartmentSelectComponent },
  { path: 'relatorio/:id', component: AgentReportComponent },
  { path: 'acao/:id', component: ActionComponent },
  { path: 'chat', component: ChatComponent },
  { path: '**', redirectTo: '' }
];
