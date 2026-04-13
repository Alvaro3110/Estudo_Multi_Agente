import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AgentService, AgentStep } from '../../core/agent.service';
import { AgentsStateService } from '../../core/agents-state.service';
import { AuthService } from '../../core/auth.service';
import { HitlCardComponent } from '../../shared/components/hitl-card/hitl-card.component';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { PipelineTrackerComponent, PipelineState } from '../../shared/components/pipeline-tracker/pipeline-tracker.component';
import { AgentBubbleComponent } from '../../shared/components/agent-bubble/agent-bubble.component';
import { AgentDrawerComponent } from '../../shared/components/agent-drawer/agent-drawer.component';
import { ReportCardComponent } from '../../shared/components/report-card/report-card.component';

type ChatState = 'idle' | 'streaming' | 'waiting';

interface ChatMessage {
  type: 'user' | 'agent_report' | 'error' | 'checkpoint' | 'stream_final' | 'assistant';
  content?: string;
  step?: AgentStep;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HitlCardComponent,
    MarkdownPipe,
    PipelineTrackerComponent,
    AgentBubbleComponent,
    AgentDrawerComponent,
    ReportCardComponent
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private agentService = inject(AgentService);
  private agentsStateService = inject(AgentsStateService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  userInput: string = '';
  messages: ChatMessage[] = [];
  state: ChatState = 'idle';
  currentSessionId: string | null = null;
  isWaitingHitl: boolean = false;
  agentCount: number = 4;
  readonly AGENT_ID = 'main-agent';
  
  // Pipeline Tracker State
  currentPipeline: PipelineState | null = null;
  pipelineVisible = false;
  isStreaming = false;

  // Agent Drawer State
  drawerOpen = false;
  drawerSteps: AgentStep[] = [];
  drawerActiveNode: string | null = null;

  // FIX 1: Inicialização síncrona do acesso ao Monitor
  // Garante que hasMonitorAccess está correto antes de qualquer interação
  get hasMonitorAccess(): boolean {
    return this.authService.hasMonitorAccess();
  }

  departmentContext: string = 'auto';
  showHistoricoReturnBanner = false;

  ngOnInit() {
    this.agentsStateService.registerAgent(this.AGENT_ID, 'Agente Principal');
    
    this.route.queryParams.subscribe(params => {
      if (params['query']) {
        this.userInput = params['query'];
        this.departmentContext = params['dept'] || 'auto';
      }
      if (params['from'] === 'historico') {
        this.showHistoricoReturnBanner = true;
      }
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleDrawer() {
    if (!this.hasMonitorAccess) return;
    this.drawerOpen = !this.drawerOpen;
  }

  send() {
    if (this.state !== 'idle' || !this.userInput.trim() || this.isWaitingHitl) return;

    this.showHistoricoReturnBanner = false;
    const message = this.userInput.trim();
    this.messages.push({ type: 'user', content: message });
    this.userInput = '';
    
    // FIX 3: Limpa drawer steps para nova query (força reset do selectedTab no drawer)
    this.drawerSteps = [];
    this.drawerActiveNode = null;
    
    this.currentPipeline = null;
    this.pipelineVisible = true;
    this.isStreaming = true;
    this.state = 'streaming';

    this.agentService.runAgent({
      message,
      department_id: this.departmentContext, 
      group_context: 'Varejo Digital SP'
    }).subscribe({
      next: (step) => this.onStepReceived(step),
      error: (err) => this.handleError(err),
      // FIX 4: Garante reset de estado quando o stream se encerra (mesmo sem complete event)
      complete: () => this.ensureIdleState()
    });
  }

  onHitlDecision(event: {sessionId: string, approved: boolean}) {
    this.isWaitingHitl = false;
    this.state = 'streaming';
    this.pipelineVisible = true;
    
    this.agentService.resumeAgent(event.sessionId, event.approved).subscribe({
      next: (step) => this.onStepReceived(step),
      error: (err) => this.handleError(err),
      complete: () => this.ensureIdleState()
    });
  }

  onStepReceived(step: AgentStep) {
    if (step.session_id) this.currentSessionId = step.session_id;

    // Coleta steps com node_detail para o drawer (pipeline de monitoramento)
    if (step.node_detail?.['node']) {
      this.drawerSteps = [...this.drawerSteps, step];
      this.drawerActiveNode = step.node_detail['node'];
    }

    switch (step.type) {
      case 'thinking':
      case 'action':
        if (step.pipeline_state) {
          this.currentPipeline = step.pipeline_state;
          this.pipelineVisible = true;
        }
        break;

      case 'agent_report':
        if (this.hasMonitorAccess) {
          // Monitor ativo: relatório do agente vai APENAS ao drawer
          // Evita duplicatas (agente pode ter sido adicionado via node_detail)
          const alreadyCaptured = this.drawerSteps.some(s => 
            s.type === 'agent_report' && s.agent_id === step.agent_id
          );
          if (!alreadyCaptured) {
            this.drawerSteps = [...this.drawerSteps, step];
          }
        } else {
          // Usuário sem Monitor: exibe normalmente no chat
          this.messages.push({ type: 'agent_report', step });
        }
        break;

      case 'stream':
        this.appendStreamChunk(step.content);
        break;

      case 'complete':
        this.drawerActiveNode = null;
        this.pipelineVisible = false;
        this.currentPipeline = null;
        this.isStreaming = false;
        this.state = 'idle';

        // Anexa o step 'complete' à última mensagem stream_final,
        // permitindo ao template acessar step.report para o ReportCard
        if (step.report) {
          const lastStreamMsg = [...this.messages].reverse()
            .find(m => m.type === 'stream_final');
          if (lastStreamMsg) {
            lastStreamMsg.step = step;
          }
        }
        break;

      case 'error':
        this.pipelineVisible = false;
        this.isStreaming = false;
        this.state = 'idle';
        this.messages.push({ type: 'error', step });
        break;

      case 'checkpoint':
        this.pipelineVisible = false;
        this.isWaitingHitl = true;
        this.state = 'waiting';
        this.messages.push({ type: 'checkpoint', step });
        break;
    }

    this.agentsStateService.updateAgent(this.AGENT_ID, step);
  }

  /** FIX 4: Garante que o estado volta a idle quando o stream se encerra */
  private ensureIdleState() {
    if (this.state === 'streaming') {
      this.drawerActiveNode = null;
      this.pipelineVisible = false;
      this.currentPipeline = null;
      this.isStreaming = false;
      this.state = 'idle';
    }
  }

  private appendStreamChunk(chunk: string) {
    if (!chunk) return;
    
    const lastMsg = this.messages[this.messages.length - 1];
    if (lastMsg && lastMsg.type === 'stream_final') {
      lastMsg.content = (lastMsg.content || '') + chunk;
    } else {
      this.messages.push({ type: 'stream_final', content: chunk });
    }
  }

  private handleError(err: any) {
    this.state = 'idle';
    this.isWaitingHitl = false;
    this.pipelineVisible = false;
    this.isStreaming = false;
    
    if (this.messages.length === 0 || this.messages[this.messages.length - 1].type !== 'error') {
       this.messages.push({ 
         type: 'error', 
         step: { type: 'error', content: 'Erro de comunicação com o servidor.' } as AgentStep
       });
    }
  }

  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }
}
