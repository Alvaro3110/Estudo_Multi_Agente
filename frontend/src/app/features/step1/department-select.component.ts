import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { ContextBarComponent } from '../../shared/context-bar/context-bar.component';
import { DashboardService } from '../../core/dashboard.service';
import { DepartmentCardComponent } from './department-card.component';
import { Department } from '../../core/models';

@Component({
  selector: 'app-department-select',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StepperComponent, ContextBarComponent, DepartmentCardComponent],
  template: `
    <app-header></app-header>
    <app-stepper [currentStep]="1"></app-stepper>
    <app-context-bar></app-context-bar>
    
    <main style="background: white; min-height: calc(100vh - 120px); padding-bottom: 30px;">
      <div class="dept-grid">
        <app-department-card 
          *ngFor="let dept of departments$ | async" 
          [dept]="dept"
          (acessar)="onAcessar($event)"
          (consultar)="onConsultar($event)">
        </app-department-card>
      </div>
    </main>
  `,
  styleUrls: ['./department-select.component.scss']
})
export class DepartmentSelectComponent implements OnInit {
  departments$ = this.dashboardService.getDepartments();

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit() {}

  onAcessar(dept: Department) {
    this.router.navigate(['/relatorio', dept.id]);
  }

  onConsultar(dept: Department) {
    this.router.navigate(['/chat'], { queryParams: { dept: dept.id } });
  }
}
