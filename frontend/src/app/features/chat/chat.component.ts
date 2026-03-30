import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService, AgentStep } from '../../core/agent.service';
import { AgentsStateService } from '../../core/agents-state.service';
import { HitlCardComponent } from '../../shared/components/hitl-card/hitl-card.component';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

type ChatState = 'idle' | 'streaming' | 'waiting';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HitlCardComponent, MarkdownPipe],
  template: `
    <div class="chat-container">
      <!-- PARTE 1 — HEADER DO CHAT -->
      <header class="chat-header">
        <div class="header-left">
          <div class="agent-avatar-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div class="header-info">
            <div class="title">Agente Principal</div>
            <div class="subtitle">Orquestra múltiplos agentes especializados</div>
          </div>
        </div>
        <div class="header-right">
          <div class="group-pill">Varejo Digital SP</div>
          <div class="status-badge">
            <span class="dot pulse"></span>
            monitorado no painel
          </div>
        </div>
      </header>

      <main class="chat-messages" #scrollContainer>
        <div *ngFor="let msg of chatHistory" [ngClass]="['message-row', msg.role]">
          <div class="agent-avatar-msg" *ngIf="msg.role === 'assistant'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
          <div class="bubble-wrapper">
            <div class="agent-name" *ngIf="msg.role === 'assistant'">Agente Principal</div>
            <div [ngClass]="msg.role === 'user' ? 'msg-user-bubble' : 'msg-agent-bubble'" [innerHTML]="msg.content | markdown">
            </div>
          </div>
        </div>

        <!-- Passos dinâmicos do streaming -->
        <div *ngFor="let step of currentSteps" class="step-container">
          
          <div *ngIf="step.type === 'thinking'" class="status-thinking">
            <div class="spinner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </div>
            <i>{{ step.content }}</i>
          </div>

          <div *ngIf="step.type === 'action'" class="status-exec">
             <div class="exec-icon">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2">
                 <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
               </svg>
             </div>
             <span><strong>Executando:</strong> {{ step.content }}</span>
          </div>

          <!-- Relatórios Parciais dos Agentes -->
          <div *ngIf="step.type === 'agent_report'" class="agent-report-card">
            <div class="report-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B30000" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Relatório: {{ step.agent_id }}</span>
            </div>
            <div class="report-content" [innerHTML]="step.content | markdown"></div>
            <div class="report-meta" *ngIf="step.metadata?.['query_sql']">
              <details>
                <summary>Ver consulta SQL originária</summary>
                <code>{{ step.metadata?.['query_sql'] }}</code>
              </details>
            </div>
          </div>

          <!-- Streaming Real-time (Resposta sendo construída) -->
          <div *ngIf="step.type === 'stream' && currentResponseContent" class="message-row assistant">
             <div class="agent-avatar-msg">
               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                 <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                 <circle cx="12" cy="12" r="3"></circle>
               </svg>
             </div>
             <div class="bubble-wrapper">
               <div class="agent-name">Agente Principal (escrevendo...)</div>
               <div class="msg-agent-bubble streaming-text">
                 {{ currentResponseContent }}
                 <span class="cursor">|</span>
               </div>
             </div>
          </div>

          <app-hitl-card 
            *ngIf="step.type === 'checkpoint'" 
            [step]="step" 
            (decision)="onHitlDecision($event)">
          </app-hitl-card>

          <div *ngIf="step.type === 'complete'" class="status-thinking">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2">
              <path d="M20 6L9 17l-5-5"></path>
            </svg>
            <i>{{ step.content }}</i>
          </div>
        </div>
      </main>

      <footer class="chat-input-wrapper">
        <div class="input-context">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="2">
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Agente Principal · {{ agentCount }} agentes disponíveis · Varejo Digital SP
        </div>

        <div class="input-row">
          <textarea 
            [(ngModel)]="userInput" 
            (keydown.enter)="$event.preventDefault(); send()" 
            [disabled]="isWaitingHitl || state === 'streaming'"
            placeholder="Peça algo..."
            rows="1"></textarea>
          
          <button class="send-btn" (click)="send()" [disabled]="isWaitingHitl || state === 'streaming' || !userInput.trim()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>

        <div class="input-hint" *ngIf="isWaitingHitl">
          Aguardando aprovação antes de continuar
        </div>
      </footer>
    </div>
  `,
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  userInput: string = '';
  chatHistory: { role: string; content: string }[] = [];
  currentSteps: AgentStep[] = [];
  state: ChatState = 'idle';
  currentSessionId: string | null = null;
  isWaitingHitl: boolean = false;
  agentCount: number = 4;
  readonly AGENT_ID = 'main-agent';
  currentResponseContent: string = '';

  constructor(
    private agentService: AgentService,
    private agentsStateService: AgentsStateService
  ) {}

  ngOnInit() {
    this.agentsStateService.registerAgent(this.AGENT_ID, 'Agente Principal');
  }

  send() {
    if (this.state !== 'idle' || !this.userInput.trim() || this.isWaitingHitl) return;

    const message = this.userInput.trim();
    this.chatHistory.push({ role: 'user', content: message });
    this.userInput = '';
    this.currentSteps = [];
    this.currentResponseContent = '';
    this.state = 'streaming';

    this.agentService.runAgent({
      message,
      department_id: 'auto', 
      group_context: 'Varejo Digital SP'
    }).subscribe({
      next: (step) => this.processStep(step),
      error: (err) => this.handleError(err)
    });
  }

  onHitlDecision(event: {sessionId: string, approved: boolean}) {
    this.isWaitingHitl = false;
    this.state = 'streaming';
    
    this.agentService.resumeAgent(event.sessionId, event.approved).subscribe({
      next: (step) => this.processStep(step),
      error: (err) => this.handleError(err)
    });
  }

  private processStep(step: AgentStep) {
    if (step.session_id) this.currentSessionId = step.session_id;

    if (step.type === 'stream') {
      this.currentResponseContent += step.content;
      // Garante que o passo de streaming esteja na lista para ser renderizado
      const hasStreamStep = this.currentSteps.some(s => s.type === 'stream');
      if (!hasStreamStep) {
        this.currentSteps.push(step);
      }
    } else if (step.type === 'agent_report') {
      this.currentSteps.push(step);
    } else if (step.type === 'checkpoint') {
      this.isWaitingHitl = true;
      this.state = 'waiting';
      this.currentSteps.push(step);
    } else if (step.type === 'complete') {
      this.state = 'idle';
      this.isWaitingHitl = false;
      if (this.currentResponseContent) {
        this.chatHistory.push({ role: 'assistant', content: this.currentResponseContent });
        this.currentResponseContent = '';
      }
      this.currentSteps.push(step);
    } else {
      this.currentSteps.push(step);
    }

    this.agentsStateService.updateAgent(this.AGENT_ID, step);
    this.scrollToBottom();
  }

  private handleError(err: any) {
    console.error('Erro:', err);
    this.state = 'idle';
    this.isWaitingHitl = false;
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.querySelector('.chat-messages');
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);
  }
}
