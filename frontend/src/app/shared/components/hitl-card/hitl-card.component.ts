import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentStep } from '../../../core/agent.service';

@Component({
  selector: 'app-hitl-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hitl-card">
      <div class="card-header">
        <div class="icon-warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="header-text">
          <div class="title">Aprovação necessária</div>
          <div class="source">Agente Principal · checkpoint HITL</div>
        </div>
        <div class="badge-waiting" *ngIf="!decisionMade">aguardando</div>
      </div>

      <div class="card-body">
        <p [innerHTML]="processContent(step.content)"></p>
      </div>

      <div class="card-actions" *ngIf="!decisionMade">
        <button class="btn approve" (click)="makeDecision(true)">✓ Aprovar ajuste</button>
        <button class="btn cancel" (click)="makeDecision(false)">✕ Cancelar</button>
      </div>

      <div class="decision-confirmation" *ngIf="decisionMade" [ngClass]="isApproved ? 'approved' : 'cancelled'">
        <ng-container *ngIf="isApproved">
          ✓ Ajuste aprovado e encaminhado
        </ng-container>
        <ng-container *ngIf="!isApproved">
          ✕ Ação cancelada
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./hitl-card.component.scss']
})
export class HitlCardComponent {
  @Input() step!: AgentStep;
  @Output() decision = new EventEmitter<{sessionId: string, approved: boolean}>();

  decisionMade = false;
  isApproved = false;

  processContent(content: string): string {
    // Negrito para valores monetários
    return content.replace(/(R\$ [\d\.,]+)/g, '<strong>$1</strong>');
  }

  makeDecision(approved: boolean) {
    this.decisionMade = true;
    this.isApproved = approved;
    this.decision.emit({ sessionId: this.step.session_id!, approved });
  }
}
