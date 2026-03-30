import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionItem } from '../../core/dashboard.service';

@Component({
  selector: 'app-action-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-card" [class.dismissed]="item.decision === 'dismiss'">
      <div class="card-main">
        <div class="priority-bar" [ngClass]="item.priority"></div>
        
        <div class="icon-box" [ngClass]="item.iconType">
          <svg *ngIf="item.iconType === 'phone'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <svg *ngIf="item.iconType === 'alert'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <svg *ngIf="item.iconType === 'chart'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          <svg *ngIf="item.iconType === 'monitor'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          <svg *ngIf="item.iconType === 'shield'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        </div>

        <div class="content">
          <div class="title">{{ item.title }}</div>
          <div class="description">{{ item.description }}</div>
          <div class="meta">
            <span class="source">{{ item.agentSource }}</span>
            <span class="dot">•</span>
            <span class="prio-text">{{ getPriorityLabel(item.priority) }}</span>
          </div>
        </div>
      </div>

      <div class="actions-grid">
        <button class="btn approve" [attr.aria-label]="'Aprovar ' + item.title" [class.selected]="item.decision === 'approve'" (click)="makeDecision('approve')">
          ✓ Aprovar
        </button>
        <button class="btn delegate" [attr.aria-label]="'Delegar ' + item.title" [class.selected]="item.decision === 'delegate'" (click)="makeDecision('delegate')">
          ↗ Delegar
        </button>
        <button class="btn dismiss" [attr.aria-label]="'Dispensar ' + item.title" [class.selected]="item.decision === 'dismiss'" (click)="makeDecision('dismiss')">
          ✕ Dispensar
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./action-card.component.scss']
})
export class ActionCardComponent {
  @Input() item!: ActionItem;
  @Output() decided = new EventEmitter<{id: string, decision: 'approve' | 'delegate' | 'dismiss'}>();

  getPriorityLabel(p: string): string {
    if (p === 'high') return 'urgente';
    if (p === 'medium') return 'moderada';
    return 'baixa prioridade';
  }

  makeDecision(decision: 'approve' | 'delegate' | 'dismiss') {
    this.decided.emit({ id: this.item.id, decision });
  }
}
