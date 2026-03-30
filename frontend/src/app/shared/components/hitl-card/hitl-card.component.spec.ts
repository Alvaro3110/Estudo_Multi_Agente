import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HitlCardComponent } from './hitl-card.component';
import { By } from '@angular/platform-browser';

describe('HitlCardComponent', () => {
  let component: HitlCardComponent;
  let fixture: ComponentFixture<HitlCardComponent>;

  const mockStep: any = {
    type: 'checkpoint',
    content: 'Deseja aprovar o ajuste de R$ 1.500,00?',
    session_id: 's1'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HitlCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HitlCardComponent);
    component = fixture.componentInstance;
    component.step = mockStep;
    fixture.detectChanges();
  });

  it('deve exibir conteúdo do step com valor em negrito', () => {
    const body = fixture.debugElement.query(By.css('.card-body p')).nativeElement;
    expect(body.innerHTML).toContain('<strong>R$ 1.500,00</strong>');
  });

  it('deve exibir badge "aguardando"', () => {
    const badge = fixture.debugElement.query(By.css('.badge-waiting')).nativeElement;
    expect(badge.textContent).toBe('aguardando');
  });

  it('clique em Aprovar emite decision com approved=true e sessionId correto', () => {
    spyOn(component.decision, 'emit');
    const btn = fixture.debugElement.query(By.css('.btn.approve'));
    btn.triggerEventHandler('click', null);
    
    expect(component.decision.emit).toHaveBeenCalledWith({ sessionId: 's1', approved: true });
    expect(component.decisionMade).toBeTrue();
    expect(component.isApproved).toBeTrue();
  });

  it('clique em Cancelar emite decision com approved=false', () => {
    spyOn(component.decision, 'emit');
    const btn = fixture.debugElement.query(By.css('.btn.cancel'));
    btn.triggerEventHandler('click', null);
    
    expect(component.decision.emit).toHaveBeenCalledWith({ sessionId: 's1', approved: false });
    expect(component.decisionMade).toBeTrue();
    expect(component.isApproved).toBeFalse();
  });

  it('após decisão, botões somem e exibe confirmação', () => {
    component.makeDecision(true);
    fixture.detectChanges();
    
    const actions = fixture.debugElement.query(By.css('.card-actions'));
    expect(actions).toBeNull();
    
    const confirmation = fixture.debugElement.query(By.css('.decision-confirmation')).nativeElement;
    expect(confirmation.textContent).toContain('Ajuste aprovado e encaminhado');
    expect(confirmation.classList).toContain('approved');
  });
});
