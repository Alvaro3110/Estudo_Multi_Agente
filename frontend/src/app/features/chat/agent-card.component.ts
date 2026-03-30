import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentState } from '../../core/agents-state.service';

@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="agent-card" [ngClass]="agent.status">
      <div class="card-header">
        <h3>{{ agent.name }}</h3>
        <span class="badge" [ngClass]="agent.status">
          {{ agent.status | uppercase }}
        </span>
      </div>

      <div class="card-body">
        <p class="last-step" *ngIf="agent.lastStep">
          <strong>Último:</strong> {{ agent.lastStep.content }}
        </p>

        <div *ngIf="agent.status === 'waiting'" class="waiting-actions">
          <p>⚠️ Aguardando sua decisão...</p>
          <div class="btn-group">
            <button class="btn approve" (click)="decide(true)">Aprovar</button>
            <button class="btn cancel" (click)="decide(false)">Cancelar</button>
          </div>
        </div>

        <div class="history-toggle" (click)="showHistory = !showHistory">
          {{ showHistory ? '⬇️ Ocultar Histórico' : '➡️ Ver Histórico' }}
        </div>

        <ul class="history-list" *ngIf="showHistory">
          <li *ngFor="let step of agent.history">
            <span class="step-icon">{{ getIcon(step.type) }}</span>
            <span class="step-content">{{ step.content }}</span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .agent-card {
      border: 1px solid #ddd;
      border-radius: 12px;
      padding: 1.5rem;
      background: #fff;
      box-shadow: 0 4px 6px rgba(0,0,0,0.05);
      transition: transform 0.2s;
      &:hover { transform: translateY(-4px); }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      h3 { margin: 0; font-size: 1.2rem; }
    }

    .badge {
      padding: 0.25rem 0.6rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: bold;
      color: white;
      &.thinking { background: #007bff; }
      &.action { background: #ffc107; color: #333; }
      &.waiting { 
        background: #fd7e14; 
        animation: pulse 1.5s infinite;
      }
      &.complete { background: #28a745; }
      &.error { background: #dc3545; }
      &.idle { background: #6c757d; }
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(253, 126, 20, 0.7); }
      70% { box-shadow: 0 0 0 10px rgba(253, 126, 20, 0); }
      100% { box-shadow: 0 0 0 0 rgba(253, 126, 20, 0); }
    }

    .btn-group {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .btn {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      &.approve { background: #28a745; color: white; }
      &.cancel { background: #dc3545; color: white; }
    }

    .history-toggle {
      margin-top: 1rem;
      font-size: 0.85rem;
      color: #007bff;
      cursor: pointer;
      text-decoration: underline;
    }

    .history-list {
      list-style: none;
      padding: 0;
      margin: 1rem 0 0 0;
      border-top: 1px solid #eee;
      max-height: 200px;
      overflow-y: auto;
      li {
        padding: 0.5rem 0;
        font-size: 0.8rem;
        display: flex;
        gap: 0.5rem;
        border-bottom: 1px solid #f9f9f9;
      }
    }
  `]
})
export class AgentCardComponent {
  @Input({ required: true }) agent!: AgentState;
  @Output() decision = new EventEmitter<{ sessionId: string, approved: boolean }>();

  showHistory = false;

  decide(approved: boolean) {
    if (this.agent.sessionId) {
      this.decision.emit({ sessionId: this.agent.sessionId, approved });
    }
  }

  getIcon(type: string): string {
    const icons: any = {
      thinking: '🧠',
      action: '⚡',
      checkpoint: '⏸️',
      complete: '✅',
      error: '❌'
    };
    return icons[type] || '❔';
  }
}
