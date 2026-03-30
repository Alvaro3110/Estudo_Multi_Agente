import { TestBed } from '@angular/core/testing';
import { AgentsDashboardService } from './agents-dashboard.service';

describe('AgentsDashboardService', () => {
  let service: AgentsDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgentsDashboardService);
  });

  it('deve mudar status para "running" ao aprovar HITL', (done) => {
    service.approveHitl('a2');
    service.getAgents().subscribe(agents => {
      const agent = agents.find(a => a.id === 'a2');
      expect(agent?.status).toBe('running');
      done();
    });
  });

  it('deve mudar status para "idle" ao rejeitar HITL', (done) => {
    service.rejectHitl('a2');
    service.getAgents().subscribe(agents => {
      const agent = agents.find(a => a.id === 'a2');
      expect(agent?.status).toBe('idle');
      done();
    });
  });

  it('deve emitir a lista de agentes atualizada', (done) => {
    service.getAgents().subscribe(agents => {
      expect(agents.length).toBe(4);
      expect(agents[0].id).toBe('a1');
      done();
    });
  });
});
