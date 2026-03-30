import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentStep } from '../../core/agent.service';

@Component({
  selector: 'app-checkpoint-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="checkpoint-card">
      <div class="header">
        <span class="icon">⚠️</span>
        <strong>Ação Requer Aprovação</strong>
      </div>
      <p class="content">{{ step.content }}</p>
      <div class="actions">
        <button class="btn approve" (click)="onDecision(true)">Aprovar</button>
        <button class="btn cancel" (click)="onDecision(false)">Cancelar</button>
      </div>
    </div>
  `,
  styles: [`
    .checkpoint-card {
      background: #fffbe6;
      border: 1px solid #ffe58f;
      border-radius: 8px;
      padding: 1.5rem;
      margin: 1rem 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      color: #856404;
    }
    .content {
      margin-bottom: 1.5rem;
      color: #333;
      line-height: 1.4;
    }
    .actions {
      display: flex;
      gap: 1rem;
    }
    .btn {
      flex: 1;
      padding: 0.8rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.8; }
    .approve { background: #52c41a; color: white; }
    .cancel { background: #ff4d4f; color: white; }
  `]
})
export class CheckpointCardComponent {
  @Input({ required: true }) step!: AgentStep;
  @Output() decision = new EventEmitter<boolean>();

  onDecision(approved: boolean) {
    this.decision.emit(approved);
  }
}
