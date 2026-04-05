import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { AgentService } from '../../core/agent.service';
import { AgentsStateService } from '../../core/agents-state.service';
import { of } from 'rxjs';

describe('ChatComponent', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  const mockAgentService = {
    runAgent: jasmine.createSpy('runAgent').and.returnValue(of({
      type: 'complete',
      content: 'Finalizado'
    }))
  };

  const mockAgentsStateService = {
    registerAgent: jasmine.createSpy('registerAgent'),
    updateAgent: jasmine.createSpy('updateAgent')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [
        { provide: AgentService, useValue: mockAgentService },
        { provide: AgentsStateService, useValue: mockAgentsStateService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
    expect(mockAgentsStateService.registerAgent).toHaveBeenCalled();
  });

  it('deve iniciar o streaming ao enviar mensagem válida', () => {
    component.userInput = 'Teste pipeline';
    component.send();
    expect(mockAgentService.runAgent).toHaveBeenCalled();
    expect(component.state).toBe('idle'); // finaliza no mock stream sync
    expect(component.messages.length).toBeGreaterThan(0);
  });
});
