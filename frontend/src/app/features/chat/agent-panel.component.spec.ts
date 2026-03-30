import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentPanelComponent } from './agent-panel.component';
import { AgentsStateService } from '../../core/agents-state.service';
import { AgentService } from '../../core/agent.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('AgentPanelComponent', () => {
  let component: AgentPanelComponent;
  let fixture: ComponentFixture<AgentPanelComponent>;
  let mockAgentsStateService: any;
  let mockAgentService: any;

  beforeEach(async () => {
    mockAgentsStateService = {
      getAgents: jasmine.createSpy('getAgents').and.returnValue(of([])),
      agents$: of([]),
      updateAgent: jasmine.createSpy('updateAgent')
    };

    mockAgentService = {
      resumeAgent: jasmine.createSpy('resumeAgent').and.returnValue(of({ type: 'thinking', content: 'Retomando...' }))
    };

    await TestBed.configureTestingModule({
      imports: [AgentPanelComponent],
      providers: [
        { provide: AgentsStateService, useValue: mockAgentsStateService },
        { provide: AgentService, useValue: mockAgentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve exibir mensagem de estado vazio quando não há agentes', () => {
    const emptyMsg = fixture.debugElement.query(By.css('.empty-state')).nativeElement;
    expect(emptyMsg.textContent).toContain('Nenhum agente ativo');
  });

  it('deve renderizar cards se houver agentes no estado', () => {
    mockAgentsStateService.getAgents.and.returnValue(of([
      { id: '1', name: 'Agent 1', status: 'idle', history: [] }
    ]));
    
    fixture = TestBed.createComponent(AgentPanelComponent);
    fixture.detectChanges();
    
    const cards = fixture.debugElement.queryAll(By.css('app-agent-card'));
    expect(cards.length).toBe(1);
  });

  it('deve chamar resumeAgent quando uma decisão é recebida do card', () => {
    component.handleDecision({ sessionId: 'session-123', approved: true });
    expect(mockAgentService.resumeAgent).toHaveBeenCalledWith('session-123', true);
  });
});
