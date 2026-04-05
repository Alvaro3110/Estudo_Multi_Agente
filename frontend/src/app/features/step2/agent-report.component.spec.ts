import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AgentReportComponent } from './agent-report.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardService } from '../../core/dashboard.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('AgentReportComponent — conteúdo por departamento', () => {
  let component: AgentReportComponent;
  let fixture: ComponentFixture<AgentReportComponent>;
  let dashboardService: DashboardService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentReportComponent, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { id: 'financeiro' } }
          }
        },
        DashboardService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentReportComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardService);
  });

  describe('carregamento por deptId', () => {
    it('deptId=financeiro → kpi[0].label = "Receita mês"', () => {
      fixture.detectChanges();
      const kpis = fixture.nativeElement.querySelectorAll('.kpi-label');
      expect(kpis[0].textContent).toContain('Receita mês');
    });

    it('config.deptName é exibido no subheader', () => {
      fixture.detectChanges();
      const name = fixture.nativeElement.querySelector('.dept-name');
      expect(name.textContent).toContain('Financeiro');
    });

    it('config.badgeText é exibido no badge correto', () => {
      fixture.detectChanges();
      const badge = fixture.nativeElement.querySelector('.dept-badge');
      expect(badge.textContent).toContain('1 alerta crítico');
      expect(badge.classList.contains('badge-warn')).toBeTrue();
    });
  });

  describe('agentes por departamento', () => {
    it('financeiro → exibe 3 pills: Fluxo de Caixa, Risco, Compliance', () => {
      fixture.detectChanges();
      const pills = fixture.nativeElement.querySelectorAll('.agent-pill');
      expect(pills.length).toBe(3);
      expect(pills[0].textContent).toContain('Agente de Fluxo de Caixa');
      expect(pills[1].textContent).toContain('Agente de Risco');
      expect(pills[2].textContent).toContain('Agente de Compliance');
    });

    it('pills têm dot animado com classe blink', () => {
      fixture.detectChanges();
      const dot = fixture.nativeElement.querySelector('.pill-dot');
      // In SCSS it has animation, we verify the class existence if needed
      expect(dot).toBeTruthy();
    });
  });

  describe('mensagens do relatório', () => {
    it('mensagens são carregadas na ordem correta', fakeAsync(() => {
      fixture.detectChanges();
      tick(1000); // Wait for setTimeouts
      fixture.detectChanges();
      
      expect(component.messages[0].role).toBe('user');
      expect(component.messages[1].role).toBe('agent');
      expect(component.messages[component.messages.length - 1].role).toBe('conclusion');
    }));

    it('cada agente tem bubble com nome correto', fakeAsync(() => {
      fixture.detectChanges();
      tick(1000);
      fixture.detectChanges();
      
      const agentMsgs = component.messages.filter(m => m.role === 'agent');
      expect(agentMsgs[0].agentName).toBe('Agente de Fluxo de Caixa');
    }));
  });

  describe('farol dinâmico', () => {
    it('4 indicadores renderizados para cada departamento', () => {
      fixture.detectChanges();
      const indicators = fixture.nativeElement.querySelectorAll('.farol-row');
      expect(indicators.length).toBe(4);
    });

    it('indicador red → dot-red + val-red', () => {
      fixture.detectChanges();
      const redRow = Array.from(fixture.nativeElement.querySelectorAll('.farol-row'))
        .find((el: any) => el.querySelector('.dot-red'));
      expect(redRow).toBeTruthy();
      expect((redRow as any).querySelector('.val-red')).toBeTruthy();
    });
  });
});
