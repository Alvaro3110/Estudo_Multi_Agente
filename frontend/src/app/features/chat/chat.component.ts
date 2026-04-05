import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentService, AgentStep } from '../../core/agent.service';
import { AgentsStateService } from '../../core/agents-state.service';
import { HitlCardComponent } from '../../shared/components/hitl-card/hitl-card.component';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { PipelineTrackerComponent, PipelineState } from '../../shared/components/pipeline-tracker/pipeline-tracker.component';
import { AgentBubbleComponent } from '../../shared/components/agent-bubble/agent-bubble.component';

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
    AgentBubbleComponent
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

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

  constructor(
    private agentService: AgentService,
    private agentsStateService: AgentsStateService
  ) {}

  ngOnInit() {
    this.agentsStateService.registerAgent(this.AGENT_ID, 'Agente Principal');
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  send() {
    if (this.state !== 'idle' || !this.userInput.trim() || this.isWaitingHitl) return;

    const message = this.userInput.trim();
    this.messages.push({ type: 'user', content: message });
    this.userInput = '';
    
    this.currentPipeline = null;
    this.pipelineVisible = true;
    this.isStreaming = true;
    this.state = 'streaming';

    this.agentService.runAgent({
      message,
      department_id: 'auto', 
      group_context: 'Varejo Digital SP'
    }).subscribe({
      next: (step) => this.onStepReceived(step),
      error: (err) => this.handleError(err)
    });
  }

  onHitlDecision(event: {sessionId: string, approved: boolean}) {
    this.isWaitingHitl = false;
    this.state = 'streaming';
    this.pipelineVisible = true;
    
    this.agentService.resumeAgent(event.sessionId, event.approved).subscribe({
      next: (step) => this.onStepReceived(step),
      error: (err) => this.handleError(err)
    });
  }

  onStepReceived(step: AgentStep) {
    if (step.session_id) this.currentSessionId = step.session_id;

    switch (step.type) {
      case 'thinking':
      case 'action':
        // Atualiza o tracker existente — NÃO cria nova mensagem
        if (step.pipeline_state) {
          this.currentPipeline = step.pipeline_state;
          this.pipelineVisible = true;
        }
        break;

      case 'agent_report':
        // Adiciona bubble do agente na lista de mensagens
        this.messages.push({ type: 'agent_report', step });
        break;

      case 'stream':
        // Acumula chunks no último bubble de streaming
        this.appendStreamChunk(step.content);
        break;

      case 'complete':
        // Oculta o tracker e finaliza
        this.pipelineVisible = false;
        this.currentPipeline = null;
        this.isStreaming = false;
        this.state = 'idle';
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
    console.error('Erro:', err);
    this.state = 'idle';
    this.isWaitingHitl = false;
    this.pipelineVisible = false;
    this.isStreaming = false;
    
    // Add generic error message if not already added by SSE stream
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
