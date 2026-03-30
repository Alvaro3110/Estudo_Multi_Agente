import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentState } from '../../../core/agents-dashboard.service';

@Component({
  selector: 'app-agent-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="agent-row">
      <div class="icon-container" [ngClass]="agent.iconType">
        <span class="icon">{{ getIcon() }}</span>
      </div>
      
      <div class="info">
        <div class="name truncate">{{ agent.name }}</div>
        <div class="desc truncate">{{ agent.description }}</div>
      </div>

      <div class="status-badge" [ngClass]="agent.status">
        <span class="dot"></span>
        <span class="status-text">{{ getStatusLabel() }}</span>
      </div>
    </div>
  `,
  styleUrls: ['./agent-row.component.scss']
})
export class AgentRowComponent {
  @Input({ required: true }) agent!: AgentState;

  getIcon(): string {
    const icons = { credit: '💳', fraud: '🛡️', support: '🎧', invest: '📈' };
    return icons[this.agent.iconType] || '🤖';
  }

  getStatusLabel(): string {
    const labels = {
      running: 'executando',
      waiting: 'aguardando',
      idle: 'idle',
      error: 'erro'
    };
    return labels[this.agent.status];
  }
}
