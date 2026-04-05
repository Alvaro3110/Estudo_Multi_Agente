import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { DashboardExecService } from '../../core/dashboard-exec.service';
import { ExecKpi, DeptKpi, AlertItem, AgentStatus } from '../../core/models';

@Component({
  selector: 'app-dashboard-exec',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-exec.component.html',
  styleUrls: ['./dashboard-exec.component.scss']
})
export class DashboardExecComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardExecService);
  private refreshSub?: Subscription;

  kpis: ExecKpi[] = [];
  deptKpis: DeptKpi[] = [];
  alerts: AlertItem[] = [];
  agents: AgentStatus[] = [];

  ngOnInit() {
    this.loadData();
    // Auto-refresh a cada 30 segundos
    this.refreshSub = interval(30000).subscribe(() => this.loadData());
  }

  ngOnDestroy() {
    this.refreshSub?.unsubscribe();
  }

  loadData() {
    this.dashboardService.getExecKpis().subscribe(data => this.kpis = data);
    this.dashboardService.getDeptKpis().subscribe(data => this.deptKpis = data);
    this.dashboardService.getAlerts().subscribe(data => this.alerts = data);
    this.dashboardService.getAgentStatuses().subscribe(data => this.agents = data);
  }

  getTrendClass(type: string): string {
    return 'trend-' + type;
  }

  getAlertClass(severity: string): string {
    return 'alert-' + severity;
  }

  getAgentStatusClass(status: string): string {
    return 'status-' + status;
  }

  getAgentTypeColor(type: string): string {
    const colors: any = {
      financeiro: '#EC0000',
      vendas: '#1565C0',
      logistica: '#F57F17',
      atendimento: '#43A047',
      investimentos: '#7B1FA2'
    };
    return colors[type] || '#888';
  }
}
