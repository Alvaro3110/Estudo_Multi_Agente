import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { AgentsDashboardService } from '../../core/agents-dashboard.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { AgentRowComponent } from '../../shared/components/agent-row/agent-row.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      getAgents: () => of([
        { id: 'a1', name: 'Agent 1', status: 'running', iconType: 'credit' },
        { id: 'a2', name: 'Agent 2', status: 'waiting', iconType: 'fraud' }
      ]),
      getActivity: () => of([]),
      approveHitl: jasmine.createSpy('approveHitl')
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AgentsDashboardService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve renderizar 4 cards de KPI (no template estático)', () => {
    const kpis = fixture.debugElement.queryAll(By.directive(KpiCardComponent));
    expect(kpis.length).toBe(4);
  });

  it('deve renderizar a lista de agentes do service', () => {
    const rows = fixture.debugElement.queryAll(By.directive(AgentRowComponent));
    expect(rows.length).toBe(2);
  });

  it('deve mostrar HitlCard quando houver agente em "waiting"', () => {
    const hitl = fixture.debugElement.query(By.css('app-hitl-card'));
    expect(hitl).toBeTruthy();
  });

  it('deve chamar service.approveHitl ao aprovar no card', () => {
    const hitl = fixture.debugElement.query(By.css('app-hitl-card'));
    hitl.triggerEventHandler('decision', true);
    expect(mockService.approveHitl).toHaveBeenCalledWith('a2');
  });
});
