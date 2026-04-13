import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HistoricoComponent } from './historico.component';
import { HistoricoService } from '../../core/historico.service';
import { UserGroupsService } from '../../core/user-groups.service';
import { AgentService } from '../../core/agent.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { DateRelativePipe } from '../../shared/pipes/date-relative.pipe';
import { DeptIconComponent } from '../../shared/components/dept-icon/dept-icon.component';
import { HistoricoItem } from '../../core/models';

describe('HistoricoComponent — integrado com chat', () => {
  let component: HistoricoComponent;
  let fixture: ComponentFixture<HistoricoComponent>;
  let mockHistoricoService: any;
  let mockUserGroupsService: any;
  let mockAgentService: any;

  const mHistory: HistoricoItem[] = [
    {
      id: 'h1', departmentId: 'fin', departmentName: 'Financeiro', departmentColorVariant: 'fin',
      query: 'Q1', agentCount: 2, rowCount: 100, createdAt: new Date().toISOString(),
      canContinue: true, messages: [{ id: 'm1', role: 'user', content: 'Q1', timestamp: '10:00' }]
    }
  ];

  beforeEach(async () => {
    mockHistoricoService = { getItems: () => of(mHistory) };
    mockUserGroupsService = { getGroups: () => of([{ id: 'g1', name: 'G1', active: true }]) };
    mockAgentService = { runAgent: () => of({ type: 'complete', content: 'Resp' }) };

    await TestBed.configureTestingModule({
      imports: [HistoricoComponent, RouterTestingModule, FormsModule, DateRelativePipe, DeptIconComponent],
      providers: [
        { provide: HistoricoService, useValue: mockHistoricoService },
        { provide: UserGroupsService, useValue: mockUserGroupsService },
        { provide: AgentService, useValue: mockAgentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve renderizar a lista de histórico', () => {
    const cards = fixture.nativeElement.querySelectorAll('.hl-item');
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('Financeiro');
  });

  it('deve selecionar um item e exibir mensagens', () => {
    component.selectItem(mHistory[0]);
    fixture.detectChanges();
    expect(component.selectedItem?.id).toBe('h1');
    const msg = fixture.nativeElement.querySelector('.msg-user-b');
    expect(msg.textContent).toContain('Q1');
  });

  it('deve filtrar a lista por busca', () => {
    component.searchQuery = 'Inexistente';
    component.onSearchChange();
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.hl-item');
    expect(cards.length).toBe(0);
  });

  it('sendContinuation deve adicionar mensagem e chamar serviço', fakeAsync(() => {
    component.selectItem(mHistory[0]);
    component.inputText = 'Nova pergunta';
    const spy = spyOn(mockAgentService, 'runAgent').and.callThrough();
    
    component.sendContinuation();
    expect(component.continuationMessages.length).toBe(1);
    expect(spy).toHaveBeenCalled();
    
    tick();
    fixture.detectChanges();
    expect(component.continuationMessages.length).toBe(2);
    expect(component.continuationMessages[1].content).toBe('Resp');
  }));
});
