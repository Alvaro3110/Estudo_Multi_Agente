import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { ContextBarComponent } from '../../shared/context-bar/context-bar.component';
import { DeptIconComponent } from '../../shared/components/dept-icon/dept-icon.component';
import { DashboardService } from '../../core/dashboard.service';
import { DeptReportConfig, DepartmentMetric } from '../../core/models';

@Component({
  selector: 'app-agent-report',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StepperComponent, ContextBarComponent, DeptIconComponent],
  templateUrl: './agent-report.component.html',
  styleUrls: ['./agent-report.component.scss']
})
export class AgentReportComponent implements OnInit {
  config?: DeptReportConfig;
  messages: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    const deptId = this.route.snapshot.params['id'];
    this.dashboardService.getReportConfig(deptId).subscribe(config => {
      this.config = config;
      this.loadMockMessages(config);
    });
  }

  loadMockMessages(config: DeptReportConfig): void {
    this.messages = [];

    // Mensagem inicial do usuário
    this.messages.push({
      role: 'user',
      content: `Gere o relatório completo do departamento de ${config.deptName}`
    });

    // Bubble de cada agente
    config.agents.forEach((agent, index) => {
      setTimeout(() => {
        this.messages.push({
          role: 'agent',
          agentName: agent.name,
          agentColor: agent.color,
          agentIconType: agent.iconType,
          content: agent.report,
          rowCount: agent.rowCount,
          status: agent.status,
          timestamp: this.getRelativeTime(index),
        });
      }, index * 300);
    });

    // Conclusão consolidada
    setTimeout(() => {
      this.messages.push({
        role: 'conclusion',
        content: config.summaryAfterReport,
      });
    }, config.agents.length * 300 + 200);
  }

  getTrendLabel(kpi: DepartmentMetric): string {
    if (kpi.trend === 'up') return '↑ vs mês anterior';
    if (kpi.trend === 'down') return '↓ vs mês anterior';
    return 'estável vs mês anterior';
  }

  getRelativeTime(index: number): string {
    return `hoje 09:${40 + index}`;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  nextStep(deptId: string) {
    this.router.navigate(['/acao', deptId]);
  }
}
