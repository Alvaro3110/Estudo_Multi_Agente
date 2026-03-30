import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { ContextBarComponent } from '../../shared/context-bar/context-bar.component';
import { DashboardService, AgentReport, Department } from '../../core/dashboard.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'app-agent-report',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StepperComponent, ContextBarComponent],
  templateUrl: './agent-report.component.html',
  styleUrls: ['./agent-report.component.scss']
})
export class AgentReportComponent implements OnInit {
  deptId$ = this.route.params.pipe(map(p => p['id']));
  dept$ = this.deptId$.pipe(switchMap(id => this.dashboardService.getDepartments().pipe(
    map(depts => depts.find(d => d.id === id))
  )));
  report$ = this.deptId$.pipe(switchMap(id => this.dashboardService.getAgentReport(id)));

  showBars = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    setTimeout(() => this.showBars = true, 100);
  }

  getBarColor(label: string): string {
    const colors: { [key: string]: string } = {
      'Crédito Consignado': '#EC0000',
      'Conta Corrente PJ': '#1E88E5',
      'Crédito Imobiliário': '#43A047',
      'Cartão Empresarial': '#F57F17',
      'Câmbio & Trade Finance': '#7B1FA2'
    };
    return colors[label] || '#999';
  }

  goBack() {
    this.router.navigate(['/']);
  }

  nextStep(deptId: string) {
    this.router.navigate(['/acao', deptId]);
  }
}
