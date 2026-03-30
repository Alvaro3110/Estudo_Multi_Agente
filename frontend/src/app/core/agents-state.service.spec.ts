import { TestBed } from '@angular/core/testing';
import { AgentsStateService, AgentState } from './agents-state.service';
import { AgentStep } from './agent.service';

describe('AgentsStateService', () => {
  let service: AgentsStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentsStateService);
  });

  it('deve registrar um novo agente com status idle', (done) => {
    service.registerAgent('a1', 'Agente Alpha');
    service.agents$.subscribe(agents => {
      expect(agents.length).toBe(1);
      expect(agents[0].id).toBe('a1');
      expect(agents[0].status).toBe('idle');
      done();
    });
  });

  it('deve atualizar o status e histórico do agente ao receber um step', (done) => {
    service.registerAgent('a1', 'Agente Alpha');
    const step: AgentStep = { type: 'thinking', content: 'Pensando...', session_id: 's1' };
    
    service.updateAgent('a1', step);
    
    service.agents$.subscribe(agents => {
      const agent = agents[0];
      expect(agent.status).toBe('thinking');
      expect(agent.history.length).toBe(1);
      expect(agent.history[0]).toEqual(step);
      expect(agent.sessionId).toBe('s1');
      done();
    });
  });

  it('deve remover um agente do estado', (done) => {
    service.registerAgent('a1', 'Agente Alpha');
    service.removeAgent('a1');
    
    service.agents$.subscribe(agents => {
      expect(agents.length).toBe(0);
      done();
    });
  });
});
