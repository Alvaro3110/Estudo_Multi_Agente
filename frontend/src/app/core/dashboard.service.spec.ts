import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardService);
  });

  it('deve retornar 4 departamentos em getDepartments()', (done) => {
    service.getDepartments().subscribe(depts => {
      expect(depts.length).toBe(4);
      done();
    });
  });

  it('deve atualizar o BehaviorSubject ao chamar setDecision()', (done) => {
    service.setDecision('a1', 'approve');
    service.getDecisions().subscribe(decisions => {
      expect(decisions['a1']).toBe('approve');
      done();
    });
  });

  it('deve emitir o mapa atualizado após múltiplas decisões', (done) => {
    service.setDecision('a1', 'approve');
    service.setDecision('a2', 'dismiss');
    service.getDecisions().subscribe(decisions => {
      expect(decisions['a1']).toBe('approve');
      expect(decisions['a2']).toBe('dismiss');
      done();
    });
  });
});
