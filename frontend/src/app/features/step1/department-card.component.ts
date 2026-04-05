import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Department } from '../../core/models';
import { DeptIconComponent } from '../../shared/components/dept-icon/dept-icon.component';

@Component({
  selector: 'app-department-card',
  standalone: true,
  imports: [CommonModule, DeptIconComponent],
  template: `
    <div class="card" [class.card-hover]="true"
         (mouseenter)="hovered=true" (mouseleave)="hovered=false">

      <!-- 1. HEADER -->
      <div class="card-head">
        <div class="card-ico" [ngClass]="'ico-' + dept.iconType">
          <app-dept-icon [type]="dept.iconType"></app-dept-icon>
        </div>
        <div class="card-head-info">
          <div class="card-name">{{ dept.name }}</div>
          <div class="card-status">
            <div class="card-status-dot"></div>
            Pronto para análise
          </div>
        </div>
      </div>

      <!-- 2. MÉTRICAS (3 KPIs) -->
      <div class="card-metrics">
        <div class="metric" *ngFor="let m of dept.metrics">
          <div class="metric-lbl">{{ m.label }}</div>
          <div class="metric-val" [ngClass]="'trend-' + m.trend">
            {{ m.value }}
          </div>
        </div>
      </div>

      <!-- 3. TEXTO CONVERSACIONAL -->
      <div class="card-summary">{{ dept.summary }}</div>

      <!-- 4. FAROL DE INDICADORES -->
      <div class="card-farol">
        <div class="farol-lbl">indicadores</div>
        <div class="farol-row" *ngFor="let ind of dept.indicators">
          <div class="farol-dot" [ngClass]="'dot-' + ind.status"></div>
          <span class="farol-text">{{ ind.label }}</span>
          <span class="farol-val" [ngClass]="'val-' + ind.status">
            {{ ind.value }}
          </span>
        </div>
      </div>

      <!-- DIVISOR -->
      <div class="card-div"></div>

      <!-- 5. BOTÕES -->
      <div class="card-btns">
        <button class="btn-primary" (click)="onAcessar()">
          <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          Acessar Central
        </button>
        <button class="btn-secondary" (click)="onConsultar($event)">
          <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          Consultar IA
        </button>
      </div>

    </div>
  `,
  styleUrls: ['./department-card.component.scss']
})
export class DepartmentCardComponent {
  @Input() dept!: Department;
  @Output() acessar = new EventEmitter<Department>();
  @Output() consultar = new EventEmitter<Department>();
  
  hovered = false;

  onAcessar() {
    this.acessar.emit(this.dept);
  }

  onConsultar(event: Event) {
    event.stopPropagation();
    this.consultar.emit(this.dept);
  }
}
