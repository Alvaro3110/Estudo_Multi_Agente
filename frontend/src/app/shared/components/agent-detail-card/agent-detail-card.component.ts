import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AgentInsight {
  boldPart?: string;
  normalPart?: string;
}

@Component({
  selector: 'app-agent-detail-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="agent-card">
      <div class="card-header">
        <div class="header-left">
          <div class="icon-box" [style.background-color]="iconBg">
            <span class="icon">{{ icon }}</span>
          </div>
          <div class="titles">
            <h3>{{ name }}</h3>
            <p>{{ category }}</p>
          </div>
        </div>
        <div class="status-badge" [ngClass]="status">
          <span class="dot"></span> {{ status === 'concluído' ? 'concluído' : 'analisando' }}
        </div>
      </div>

      <ul class="insights-list">
        <li *ngFor="let insight of insights">
          <span class="bullet" [style.background-color]="status === 'concluído' ? '#2E7D32' : '#F57F17'"></span>
          <span class="text">
            <strong *ngIf="insight.boldPart">{{ insight.boldPart }}</strong> 
            {{ insight.normalPart }}
          </span>
        </li>
      </ul>

      <div class="card-footer">
        <span class="time">{{ time }}</span>
        <a (click)="onViewDetail($event)" class="action-link" [class.alt]="status === 'analisando'">
           {{ status === 'concluído' ? 'ver detalhe' : 'acompanhar' }} →
        </a>
      </div>
    </div>
  `,
  styleUrls: ['./agent-detail-card.component.scss']
})
export class AgentDetailCardComponent {
  @Input() icon: string = '$';
  @Input() iconBg: string = '#FEEEEE';
  @Input() name: string = '';
  @Input() category: string = '';
  @Input() status: 'concluído' | 'analisando' = 'concluído';
  @Input() insights: AgentInsight[] = [];
  @Input() time: string = '';

  @Output() viewDetail = new EventEmitter<void>();

  onViewDetail(event: Event) {
    event.preventDefault();
    this.viewDetail.emit();
  }
}
