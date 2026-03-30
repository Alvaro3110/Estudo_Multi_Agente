import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentCardComponent } from './agent-card.component';
import { AgentState } from '../../core/agents-state.service';
import { By } from '@angular/platform-browser';

describe('AgentCardComponent', () => {
  let component: AgentCardComponent;
  let fixture: ComponentFixture<AgentCardComponent>;

  const mockAgent: AgentState = {
    id: 'a1',
    name: 'Test Agent',
    status: 'waiting',
    lastStep: { type: 'checkpoint', content: 'Confirmar?' },
    history: [{ type: 'checkpoint', content: 'Confirmar?' }],
    sessionId: 's1'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AgentCardComponent);
    component = fixture.componentInstance;
    component.agent = mockAgent;
    fixture.detectChanges();
  });

  it('deve renderizar o nome e o badge de status esperando', () => {
    const h3 = fixture.debugElement.query(By.css('h3')).nativeElement;
    const badge = fixture.debugElement.query(By.css('.badge')).nativeElement;
    
    expect(h3.textContent).toContain('Test Agent');
    expect(badge.textContent).toContain('WAITING');
    expect(badge.classList).toContain('waiting');
  });

  it('deve exibir botões de aprovação/cancelamento em estado de espera', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn'));
    expect(buttons.length).toBe(2);
  });

  it('deve emitir decisão positiva ao clicar em Aprovar', () => {
    spyOn(component.decision, 'emit');
    const approveBtn = fixture.debugElement.query(By.css('.approve')).nativeElement;
    approveBtn.click();
    
    expect(component.decision.emit).toHaveBeenCalledWith({ sessionId: 's1', approved: true });
  });

  it('deve alternar a exibição do histórico ao clicar no toggle', () => {
    expect(fixture.debugElement.query(By.css('.history-list'))).toBeNull();
    
    const toggle = fixture.debugElement.query(By.css('.history-toggle')).nativeElement;
    toggle.click();
    fixture.detectChanges();
    
    expect(fixture.debugElement.query(By.css('.history-list'))).not.toBeNull();
  });
});
