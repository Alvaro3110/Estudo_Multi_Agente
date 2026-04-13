import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { AgentService } from '../../core/agent.service';
import { AgentsStateService } from '../../core/agents-state.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';

describe('ChatComponent — receber contexto do histórico', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let mockAgentService: any;
  let mockAgentsStateService: any;

  beforeEach(async () => {
    mockAgentService = { runAgent: () => of({}) };
    mockAgentsStateService = { 
      registerAgent: jasmine.createSpy('registerAgent'),
      updateAgent: jasmine.createSpy('updateAgent')
    };

    await TestBed.configureTestingModule({
      imports: [ChatComponent, RouterTestingModule, FormsModule, MarkdownPipe],
      providers: [
        { provide: AgentService, useValue: mockAgentService },
        { provide: AgentsStateService, useValue: mockAgentsStateService },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ query: 'Analise X', dept: 'financeiro', from: 'historico' })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve pré-preencher userInput e departmentContext via queryParams', () => {
    expect(component.userInput).toBe('Analise X');
    expect(component.departmentContext).toBe('financeiro');
    expect(component.showHistoricoReturnBanner).toBe(true);
  });

  it('deve ocultar o banner ao clicar no fechar', () => {
    component.showHistoricoReturnBanner = true;
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.hb-dismiss');
    btn.click();
    fixture.detectChanges();
    expect(component.showHistoricoReturnBanner).toBe(false);
  });
});
