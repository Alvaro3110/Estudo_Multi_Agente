import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentCardComponent } from './department-card.component';
import { Department } from '../../core/models';

describe('DepartmentCardComponent', () => {
  let component: DepartmentCardComponent;
  let fixture: ComponentFixture<DepartmentCardComponent>;

  const mockDept: Department = {
    id: 'test',
    name: 'Test Dept',
    iconType: 'cluster',
    efficiency: 91,
    status: 'ready',
    summary: 'A short summary for testing',
    metrics: [
      { label: 'One', value: '1', trend: 'up' },
      { label: 'Two', value: '2', trend: 'down' },
      { label: 'Three', value: '3', trend: 'neutral' }
    ],
    indicators: [
      { label: 'Ind 1', value: '100%', status: 'green' },
      { label: 'Ind 2', value: '90%', status: 'yellow' },
      { label: 'Ind 3', value: '80%', status: 'red' },
      { label: 'Ind 4', value: '70%', status: 'green' }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentCardComponent);
    component = fixture.componentInstance;
    component.dept = mockDept;
    fixture.detectChanges();
  });

  describe('renderização', () => {
    it('deve renderizar o nome do departamento', () => {
      const nameEl = fixture.nativeElement.querySelector('.card-name');
      expect(nameEl.textContent).toContain('Test Dept');
    });

    it('deve renderizar badge "Pronto para análise"', () => {
      const badge = fixture.nativeElement.querySelector('.card-status');
      expect(badge.textContent).toContain('Pronto para análise');
    });

    it('deve renderizar exatamente 3 métricas', () => {
      const metrics = fixture.nativeElement.querySelectorAll('.metric');
      expect(metrics.length).toBe(3);
    });

    it('deve renderizar o texto conversacional', () => {
      const summary = fixture.nativeElement.querySelector('.card-summary');
      expect(summary.textContent).toContain('A short summary for testing');
    });

    it('deve renderizar exatamente 4 indicadores do farol', () => {
      const indicators = fixture.nativeElement.querySelectorAll('.farol-row');
      expect(indicators.length).toBe(4);
    });

    it('deve renderizar botões "Acessar Central" e "Consultar IA"', () => {
      const btnPri = fixture.nativeElement.querySelector('.btn-primary');
      const btnSec = fixture.nativeElement.querySelector('.btn-secondary');
      expect(btnPri.textContent).toContain('Acessar Central');
      expect(btnSec.textContent).toContain('Consultar IA');
    });
  });

  describe('farol de cores', () => {
    it('indicador green deve ter classe dot-green e val-green', () => {
      const firstDot = fixture.nativeElement.querySelectorAll('.farol-dot')[0];
      const firstVal = fixture.nativeElement.querySelectorAll('.farol-val')[0];
      expect(firstDot.classList.contains('dot-green')).toBeTrue();
      expect(firstVal.classList.contains('val-green')).toBeTrue();
    });

    it('indicador yellow deve ter classe dot-yellow e val-yellow', () => {
      const dot = fixture.nativeElement.querySelectorAll('.farol-dot')[1];
      const val = fixture.nativeElement.querySelectorAll('.farol-val')[1];
      expect(dot.classList.contains('dot-yellow')).toBeTrue();
      expect(val.classList.contains('val-yellow')).toBeTrue();
    });

    it('indicador red deve ter classe dot-red e val-red', () => {
      const dot = fixture.nativeElement.querySelectorAll('.farol-dot')[2];
      const val = fixture.nativeElement.querySelectorAll('.farol-val')[2];
      expect(dot.classList.contains('dot-red')).toBeTrue();
      expect(val.classList.contains('val-red')).toBeTrue();
    });
  });

  describe('métricas', () => {
    it('trend up deve ter classe trend-up (cor verde)', () => {
      const m1 = fixture.nativeElement.querySelectorAll('.metric-val')[0];
      expect(m1.classList.contains('trend-up')).toBeTrue();
    });

    it('trend down deve ter classe trend-down (cor vermelha)', () => {
      const m2 = fixture.nativeElement.querySelectorAll('.metric-val')[1];
      expect(m2.classList.contains('trend-down')).toBeTrue();
    });

    it('trend neutral deve ter classe trend-neutral (cor padrão)', () => {
      const m3 = fixture.nativeElement.querySelectorAll('.metric-val')[2];
      expect(m3.classList.contains('trend-neutral')).toBeTrue();
    });
  });

  describe('interação', () => {
    it('clique em "Acessar Central" emite evento acessar', () => {
      spyOn(component.acessar, 'emit');
      const btn = fixture.nativeElement.querySelector('.btn-primary');
      btn.click();
      expect(component.acessar.emit).toHaveBeenCalledWith(mockDept);
    });

    it('clique em "Consultar IA" emite evento consultar', () => {
      spyOn(component.consultar, 'emit');
      const btn = fixture.nativeElement.querySelector('.btn-secondary');
      btn.click();
      expect(component.consultar.emit).toHaveBeenCalledWith(mockDept);
    });

    it('hover aplica classe de borda vermelha', () => {
      const card = fixture.nativeElement.querySelector('.card');
      card.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();
      expect(component.hovered).toBeTrue();
    });
  });
});
