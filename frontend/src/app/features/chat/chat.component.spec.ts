import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatComponent } from './chat.component';
import { AgentService } from '../../core/agent.service';
import { AgentsStateService } from '../../core/agents-state.service';
import { of, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

describe('ChatComponent — melhorias UX corporativo', () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;
  let agentServiceSpy: any;
  let agentsStateServiceSpy: any;

  beforeEach(async () => {
    agentServiceSpy = jasmine.createSpyObj('AgentService', ['runAgent', 'resumeAgent']);
    agentsStateServiceSpy = jasmine.createSpyObj('AgentsStateService', ['registerAgent', 'updateAgent']);

    await TestBed.configureTestingModule({
      imports: [ChatComponent, FormsModule],
      providers: [
        { provide: AgentService, useValue: agentServiceSpy },
        { provide: AgentsStateService, useValue: agentsStateServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('header', () => {
    it('deve exibir "Agente Principal" como título', () => {
      const title = fixture.debugElement.query(By.css('.header-info .title')).nativeElement.textContent;
      expect(title).toBe('Agente Principal');
    });

    it('deve exibir badge "monitorado no painel"', () => {
      const badge = fixture.debugElement.query(By.css('.status-badge')).nativeElement.textContent;
      expect(badge).toContain('monitorado no painel');
    });

    it('deve exibir pill com nome do grupo ativo', () => {
      const pill = fixture.debugElement.query(By.css('.group-pill')).nativeElement.textContent;
      expect(pill).toBe('Varejo Digital SP');
    });
  });

  describe('mensagens e status', () => {
    it('bubble do usuário deve ter a classe CSS correta', () => {
      component.chatHistory = [{ role: 'user', content: 'Olá' }];
      fixture.detectChanges();
      const bubble = fixture.debugElement.query(By.css('.msg-user-bubble'));
      expect(bubble).toBeTruthy();
    });

    it('bubble do agente deve ter nome e avatar', () => {
      component.chatHistory = [{ role: 'assistant', content: 'Olá, sou o agente' }];
      fixture.detectChanges();
      const name = fixture.debugElement.query(By.css('.agent-name')).nativeElement.textContent;
      const avatar = fixture.debugElement.query(By.css('.agent-avatar-msg'));
      expect(name).toBe('Agente Principal');
      expect(avatar).toBeTruthy();
    });

    it('step thinking deve renderizar status-thinking com spinner', () => {
      component.currentSteps = [{ type: 'thinking', content: 'Analisando dados...' }];
      fixture.detectChanges();
      const status = fixture.debugElement.query(By.css('.status-thinking'));
      expect(status.nativeElement.textContent).toContain('Analisando dados...');
    });

    it('step action deve renderizar status-exec com ícone raio', () => {
      component.currentSteps = [{ type: 'action', content: 'Gerando relatório' }];
      fixture.detectChanges();
      const status = fixture.debugElement.query(By.css('.status-exec'));
      expect(status.nativeElement.textContent).toContain('Executando: Gerando relatório');
    });
  });

  describe('HITL', () => {
    it('ao receber checkpoint, isWaitingHitl deve ser true e input desabilitado', () => {
      const step: any = { type: 'checkpoint', content: 'Aprovar?', session_id: 's1' };
      (component as any).processStep(step);
      fixture.detectChanges();
      
      expect(component.isWaitingHitl).toBeTrue();
      const textarea = fixture.debugElement.query(By.css('textarea')).nativeElement;
      expect(textarea.disabled).toBeTrue();
      const hint = fixture.debugElement.query(By.css('.input-hint')).nativeElement.textContent;
      expect(hint).toContain('Aguardando aprovação antes de continuar');
    });

    it('ao aprovar HITL, chama resumeAgent e volta para estado streaming', () => {
      agentServiceSpy.resumeAgent.and.returnValue(of({ type: 'thinking', content: 'Continuando...' }));
      component.onHitlDecision({ sessionId: 's1', approved: true });
      
      expect(agentServiceSpy.resumeAgent).toHaveBeenCalledWith('s1', true);
      expect(component.isWaitingHitl).toBeFalse();
      expect(component.state).toBe('streaming');
    });
  });

  describe('input', () => {
    it('botão enviar desabilitado quando input vazio', () => {
      component.userInput = '';
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('.send-btn')).nativeElement;
      expect(btn.disabled).toBeTrue();
    });

    it('ao enviar, chama runAgent e limpa input', () => {
      agentServiceSpy.runAgent.and.returnValue(of({ type: 'thinking', content: 'Iniciando' }));
      component.userInput = 'Teste';
      component.send();
      expect(agentServiceSpy.runAgent).toHaveBeenCalledWith('Teste');
      expect(component.userInput).toBe('');
    });
  });
});
