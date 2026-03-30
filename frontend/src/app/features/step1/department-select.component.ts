import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { ContextBarComponent } from '../../shared/context-bar/context-bar.component';
import { DashboardService, Department } from '../../core/dashboard.service';

@Component({
  selector: 'app-department-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dept-card">
      <div class="card-header">
        <div class="icon-box" [ngClass]="dept.iconType">
          <svg *ngIf="dept.iconType === 'financeiro'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          <svg *ngIf="dept.iconType === 'rh'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <svg *ngIf="dept.iconType === 'logistica'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          <svg *ngIf="dept.iconType === 'tech'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
        </div>
        <div class="header-info">
          <h3>{{ dept.name }}</h3>
          <p class="subtitle">{{ dept.agentCount }} Agentes de IA online</p>
          <p class="efficiency">Eficiência Operacional: <strong>{{ dept.efficiency }}%</strong></p>
        </div>
      </div>

      <div class="status-badge" *ngIf="dept.status === 'ready'">
        <span class="dot pulse"></span>
        Pronto para análise
      </div>

      <div class="divider"></div>

      <div class="actions-row">
        <button class="access-btn" (click)="onSelect()" [disabled]="isLoading">
          <ng-container *ngIf="!isLoading">
            Acessar Central
            <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </ng-container>
          <ng-container *ngIf="isLoading">
            <div class="spinner"></div>
          </ng-container>
        </button>

        <button class="ai-btn" (click)="onAskAI($event)" [disabled]="isLoading">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
           Consultar IA
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dept-card {
      background: white;
      border: var(--border);
      border-radius: var(--radius-lg);
      padding: 20px 22px;
      transition: border-color 0.15s, background 0.15s;
      cursor: default;
      
      &:hover {
        border-color: var(--san-red);
        background: #FEFAFA;
      }
    }

    .card-header { display: flex; gap: 14px; }

    .icon-box {
      width: 44px; height: 44px;
      background: var(--san-red-light);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: var(--san-red);
      flex-shrink: 0;
      svg { width: 22px; height: 22px; }
    }

    .header-info {
      h3 { font-size: 15px; font-weight: 500; color: var(--text-primary); margin-bottom: 2px; }
      .subtitle { font-size: 12px; color: #777; margin-bottom: 2px; }
      .efficiency { font-size: 12px; color: #777; }
    }

    .status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: #F0FBF4; border: 0.5px solid #C8E6C9; border-radius: 20px;
      padding: 3px 10px; margin-top: 10px; font-size: 11px; color: #2E7D32; font-weight: 500;

      .dot {
        width: 6px; height: 6px; background: #43A047; border-radius: 50%;
        &.pulse { animation: pulse 2s infinite; }
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }

    .divider { height: 0.5px; background: #F0F0F0; margin: 14px 0; }

    .actions-row {
      display: flex; gap: 8px; margin-top: 15px;
    }

    .access-btn {
      flex: 1; padding: 9px;
      background: var(--san-red); color: white; border-radius: 7px;
      font-size: 13px; font-weight: 500;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.2s;
      
      &:hover:not(:disabled) { background: var(--san-red-dark); }
      &:disabled { opacity: 0.8; cursor: not-allowed; }

      .arrow { width: 16px; height: 16px; }
      .spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: #FFF;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }
    }

    .ai-btn {
      flex: 1; padding: 9px;
      background: white; color: var(--san-red); border: 1px solid var(--san-red); border-radius: 7px;
      font-size: 13px; font-weight: 500;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.2s;
      
      &:hover:not(:disabled) { background: #FFF5F5; }
      svg { width: 16px; height: 16px; }
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class DepartmentCardComponent {
  @Input() dept!: Department;
  @Output() selected = new EventEmitter<Department>();

  isLoading = false;

  onSelect() {
    this.isLoading = true;
    setTimeout(() => {
      this.selected.emit(this.dept);
    }, 400);
  }

  onAskAI(event: Event) {
    event.stopPropagation();
    // Navega para o chat passando o contexto (opcionalmente via QueryParams ou Service)
    this.selected.emit({ ...this.dept, action: 'chat' } as any);
  }
}

@Component({
  selector: 'app-department-select',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StepperComponent, ContextBarComponent, DepartmentCardComponent],
  template: `
    <app-header></app-header>
    <app-stepper [currentStep]="1"></app-stepper>
    <app-context-bar></app-context-bar>
    
    <main class="page-container">
      <div class="grid-container">
        <app-department-card 
          *ngFor="let dept of departments$ | async" 
          [dept]="dept"
          (selected)="onDeptSelected($event)">
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

  onDeptSelected(dept: any) {
    if (dept.action === 'chat') {
      this.router.navigate(['/chat'], { queryParams: { dept: dept.name } });
    } else {
      this.router.navigate(['/relatorio', dept.id]);
    }
  }
}
