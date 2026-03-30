import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentsStateService, AgentState } from '../../core/agents-state.service';
import { AgentService } from '../../core/agent.service';
import { AgentCardComponent } from './agent-card.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-agent-panel',
  standalone: true,
  imports: [CommonModule, AgentCardComponent],
  template: `
    <div class="panel-container">
      <header class="panel-header">
        <h2>Painel de Monitoramento de Agentes</h2>
        <p>Acompanhe e autorize as ações dos seus agentes em tempo real.</p>
      </header>

      <div class="agents-grid" *ngIf="(agents$ | async) as agents; else loading">
        <ng-container *ngIf="agents.length > 0; else noAgents">
          <app-agent-card 
            *ngFor="let agent of agents" 
            [agent]="agent"
            (decision)="handleDecision($event)">
          </app-agent-card>
        </ng-container>
      </div>

      <ng-template #noAgents>
        <div class="empty-state">
          <span>📭</span>
          <p>Nenhum agente ativo no momento.</p>
        </div>
      </ng-template>

      <ng-template #loading>
        <div class="loading-state">Carregando agentes...</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .panel-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .panel-header {
      margin-bottom: 2rem;
      h2 { margin: 0; color: #333; }
      p { color: #666; }
    }
    .agents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .empty-state {
      text-align: center;
      padding: 4rem;
      background: #f8f9fa;
      border-radius: 12px;
      border: 2px dashed #dee2e6;
      span { font-size: 3rem; }
      p { color: #6c757d; font-weight: 500; }
    }
    .loading-state {
      text-align: center;
      padding: 2rem;
    }
  `]
})
export class AgentPanelComponent implements OnInit {
  agents$: Observable<AgentState[]>;

  constructor(
    private agentsStateService: AgentsStateService,
    private agentService: AgentService
  ) {
    this.agents$ = this.agentsStateService.getAgents();
  }

  ngOnInit(): void {}

  handleDecision(event: { sessionId: string, approved: boolean }) {
    // Ao receber uma decisão do card, retomamos o agente
    // No painel, apenas disparamos o resume; a atualização do estado
    // virá via stream consumida pelo serviço ou componente que iniciou o agente.
    // Para simplificar este exemplo, os steps são refletidos via AgentsStateService.
    
    this.agentService.resumeAgent(event.sessionId, event.approved).subscribe({
      next: (step) => {
        // Encontra o agente pelo sessionId para atualizar no estado global
        this.agentsStateService.agents$.subscribe(agents => {
          const agent = agents.find(a => a.sessionId === event.sessionId);
          if (agent) {
            this.agentsStateService.updateAgent(agent.id, step);
          }
        }).unsubscribe();
      },
      error: (err) => console.error('Erro ao retomar agente do painel:', err)
    });
  }
}
