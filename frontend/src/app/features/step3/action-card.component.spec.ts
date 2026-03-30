import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionCardComponent } from './action-card.component';
import { By } from '@angular/platform-browser';

describe('ActionCardComponent', () => {
  let component: ActionCardComponent;
  let fixture: ComponentFixture<ActionCardComponent>;

  const mockItem: any = {
    id: 'a1',
    title: 'Teste',
    priority: 'high',
    iconType: 'phone'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionCardComponent);
    component = fixture.componentInstance;
    component.item = mockItem;
    fixture.detectChanges();
  });

  describe('prioridade visual', () => {
    it('priority=high deve renderizar barra lateral com classe high', () => {
      const bar = fixture.debugElement.query(By.css('.priority-bar')).nativeElement;
      expect(bar.classList).toContain('high');
    });
  });

  describe('decisões', () => {
    it('clique em Aprovar deve emitir decided com decision="approve"', () => {
      spyOn(component.decided, 'emit');
      const btn = fixture.debugElement.query(By.css('.btn.approve'));
      btn.triggerEventHandler('click', null);
      expect(component.decided.emit).toHaveBeenCalledWith({ id: 'a1', decision: 'approve' });
    });

    it('após decisão, botão correspondente deve ter classe CSS de selecionado', () => {
      component.item = { ...mockItem, decision: 'approve' };
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('.btn.approve')).nativeElement;
      expect(btn.classList).toContain('selected');
    });
  });
});
