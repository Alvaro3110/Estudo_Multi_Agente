import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActionComponent } from './action.component';
import { DashboardService } from '../../core/dashboard.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

describe('ActionComponent — Etapa 3', () => {
  let component: ActionComponent;
  let fixture: ComponentFixture<ActionComponent>;
  let dashboardServiceSpy: any;
  let decisionsSubject: BehaviorSubject<any>;
  let router: Router;

  beforeEach(async () => {
    decisionsSubject = new BehaviorSubject({});
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getDepartments', 'getActionItems', 'getDecisions', 'setDecision', 'resetDecisions']);
    dashboardServiceSpy.getDepartments.and.returnValue(of([{ id: 'fin', name: 'Financeiro', iconType: 'financeiro' }]));
    dashboardServiceSpy.getActionItems.and.returnValue(of([
      { id: 'a1', priority: 'high' },
      { id: 'a2', priority: 'high' },
      { id: 'a3', priority: 'medium' },
      { id: 'a4', priority: 'medium' },
      { id: 'a5', priority: 'low' }
    ]));
    dashboardServiceSpy.getDecisions.and.returnValue(decisionsSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [ActionComponent, RouterTestingModule],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ActionComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('renderização inicial', () => {
    it('deve exibir 5 action cards', () => {
      const cards = fixture.debugElement.queryAll(By.css('app-action-card'));
      expect(cards.length).toBe(5);
    });

    it('deve exibir pills com contagem correta por prioridade', () => {
      const highPill = fixture.debugElement.query(By.css('.prio-pill.high')).nativeElement.textContent;
      expect(highPill).toContain('2 urgentes');
    });

    it('deve exibir botão "Concluir" desabilitado', () => {
      const btn = fixture.debugElement.query(By.css('.concluir-btn')).nativeElement;
      expect(btn.disabled).toBeTrue();
    });

    it('deve exibir mensagem "Decida sobre 5 ações para concluir"', () => {
      const info = fixture.debugElement.query(By.css('.status-info')).nativeElement.textContent;
      expect(info).toContain('Decida sobre 5 ações para concluir');
    });
  });

  describe('interação do usuário', () => {
    it('após decidir todos os 5 itens, botão "Concluir" deve ser habilitado', () => {
      decisionsSubject.next({
        'a1': 'approve',
        'a2': 'approve',
        'a3': 'delegate',
        'a4': 'delegate',
        'a5': 'dismiss'
      });
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('.concluir-btn')).nativeElement;
      expect(btn.disabled).toBeFalse();
    });

    it('após decidir todos os itens, footer deve mostrar contagem por tipo', () => {
      decisionsSubject.next({
        'a1': 'approve',
        'a2': 'approve',
        'a3': 'delegate',
        'a4': 'delegate',
        'a5': 'dismiss'
      });
      fixture.detectChanges();
      const info = fixture.debugElement.query(By.css('.status-info')).nativeElement.textContent;
      expect(info).toContain('2 aprovadas · 2 delegadas · 1 dispensadas');
    });

    it('ao clicar "Concluir", deve navegar para / e exibir toast', fakeAsync(() => {
      spyOn(router, 'navigate');
      decisionsSubject.next({'a1':'approve','a2':'approve','a3':'approve','a4':'approve','a5':'approve'});
      fixture.detectChanges();
      
      component.concluir();
      fixture.detectChanges();
      
      expect(component.showToast).toBeTrue();
      const toast = fixture.debugElement.query(By.css('.success-toast'));
      expect(toast).toBeTruthy();

      tick(3000);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(dashboardServiceSpy.resetDecisions).toHaveBeenCalled();
    }));
  });
});
