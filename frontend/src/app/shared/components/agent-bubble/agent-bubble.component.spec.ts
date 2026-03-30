import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentBubbleComponent } from './agent-bubble.component';
import { HighlightContentPipe } from '../../pipes/highlight-content.pipe';
import { SqlHighlightPipe } from '../../pipes/sql-highlight.pipe';
import { FormatCellPipe } from '../../pipes/format-cell.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('AgentBubbleComponent — renderização dinâmica', () => {
  let component: AgentBubbleComponent;
  let fixture: ComponentFixture<AgentBubbleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentBubbleComponent] // standalone
    }).compileComponents();

    fixture = TestBed.createComponent(AgentBubbleComponent);
    component = fixture.componentInstance;
  });

  describe('estado de sucesso', () => {
    it('deve renderizar header com nome e timestamp', () => {
      component.agentName = 'Agente Logística';
      component.timestamp = '10:00';
      component.step = { type: 'checkpoint', content: 'Iniciando', metadata: {} };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.rh-name')?.textContent).toContain('Agente Logística');
      expect(compiled.querySelector('.rh-time')?.textContent).toContain('10:00');
    });

    it('deve aplicar cor correta por agentType', () => {
      component.agentType = 'vendas';
      expect(component.agentColor).toBe('#EC0000');
      
      component.agentType = 'financeiro';
      expect(component.agentColor).toBe('#1565C0');
    });

    it('deve renderizar narrativa se content não vazio', () => {
      component.step = { type: 'agent_report', content: 'Análise concluída.' };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(component.hasNarrative).toBeTrue();
      expect(compiled.querySelector('.narrative')).toBeTruthy();
    });

    it('NÃO deve renderizar tabela se dados vazio', () => {
      component.step = { type: 'agent_report', content: '...', metadata: { dados: [] } };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(component.hasTable).toBeFalse();
      expect(compiled.querySelector('.data-tbl')).toBeFalsy();
    });

    it('deve renderizar tabela com colunas dinâmicas dos dados reais', () => {
      component.step = { 
        type: 'agent_report', 
        content: '', 
        metadata: { dados: [{ id: 1, name: 'Produto A' }, { id: 2, name: 'Produto B' }] } 
      };
      fixture.detectChanges();
      
      expect(component.tableColumns).toEqual(['id', 'name']);
      
      const compiled = fixture.nativeElement as HTMLElement;
      const ths = compiled.querySelectorAll('th');
      expect(ths.length).toBe(2);
      expect(ths[0].textContent?.trim()).toBe('id');
      expect(ths[1].textContent?.trim()).toBe('name');
    });

    it('deve limitar tabela a 10 linhas por padrão', () => {
      const longData = Array.from({ length: 15 }, (_, i) => ({ id: i }));
      component.step = { type: 'agent_report', content: '', metadata: { dados: longData } };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const trs = compiled.querySelectorAll('tbody tr');
      expect(trs.length).toBe(10);
      expect(component.hasMoreRows).toBeTrue();
      expect(component.extraRows).toBe(5);
    });

    it('deve expandir tabela ao clicar "ver mais"', () => {
      const longData = Array.from({ length: 15 }, (_, i) => ({ id: i }));
      component.step = { type: 'agent_report', content: '', metadata: { dados: longData } };
      fixture.detectChanges();
      
      component.showAllRows = true;
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const trs = compiled.querySelectorAll('tbody tr');
      expect(trs.length).toBe(15);
    });

    it('deve limitar tabela a 8 colunas', () => {
      const wideRow: any = {};
      for (let i = 0; i < 12; i++) {
        wideRow[`col${i}`] = i;
      }
      component.step = { type: 'agent_report', content: '', metadata: { dados: [wideRow] } };
      fixture.detectChanges();
      
      expect(component.tableColumns.length).toBe(8);
      expect(component.tableColumns[7]).toBe('col7');
    });

    it('deve renderizar query SQL colapsada por padrão', () => {
      component.step = { type: 'agent_report', content: '', metadata: { query_sql: 'SELECT * FROM t' } };
      fixture.detectChanges();
      
      expect(component.hasSql).toBeTrue();
      expect(component.sqlExpanded).toBeFalse();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.sql-body')).toBeFalsy();
    });

    it('deve expandir SQL ao clicar no toggle', () => {
      component.step = { type: 'agent_report', content: '', metadata: { query_sql: 'SELECT * FROM t' } };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const toggle = compiled.querySelector('.sql-toggle') as HTMLElement;
      toggle.click();
      fixture.detectChanges();
      
      expect(component.sqlExpanded).toBeTrue();
      expect(compiled.querySelector('.sql-body')).toBeTruthy();
    });

    it('deve renderizar insights com dot colorido correto', () => {
      component.step = { 
        type: 'agent_report', 
        content: '', 
        metadata: { insights: ['Um insight normal'] } 
      };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.insights')).toBeTruthy();
      expect(compiled.querySelectorAll('.ins-row').length).toBe(1);
    });

    it('deve colorir dot verde para texto com "crescimento"', () => {
      expect(component.getInsightColor('Forte crescimento nas vendas')).toBe('#43A047');
    });

    it('deve colorir dot vermelho para texto com "risco"', () => {
      expect(component.getInsightColor('Alto risco de falha')).toBe('#EC0000');
    });

    it('deve renderizar barra de score com largura proporcional', () => {
      component.step = { type: 'agent_report', content: '', metadata: { score_confianca: 0.75 } };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const fill = compiled.querySelector('.score-fill') as HTMLElement;
      expect(fill.style.width).toBe('75%');
    });

    it('score >= 0.8 → barra verde', () => {
      expect(component.getScoreColor(0.85)).toBe('#43A047');
    });

    it('score < 0.6 → barra vermelha', () => {
      expect(component.getScoreColor(0.5)).toBe('#EC0000');
    });

    it('NÃO deve renderizar score se metadata.score_confianca = 0', () => {
      component.step = { type: 'agent_report', content: '', metadata: { score_confianca: 0 } };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(component.hasScore).toBeFalse();
      expect(compiled.querySelector('.score-footer')).toBeFalsy();
    });
  });

  describe('estado de erro', () => {
    it('deve renderizar banner de erro se type = "error"', () => {
      component.step = { type: 'error', content: 'Token inválido' };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(component.isError).toBeTrue();
      expect(compiled.querySelector('.err-banner')).toBeTruthy();
    });

    it('deve exibir SQL tentado se metadata.query_sql presente', () => {
      component.step = { type: 'error', content: '', metadata: { query_sql: 'SELECT FAIL' } };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.sql-block')).toBeTruthy();
    });

    it('deve exibir sugestão com primeiro insight', () => {
      component.step = { type: 'error', content: '', metadata: { insights: ['Sintaxe errada'] } };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.suggestion')).toBeTruthy();
      expect(compiled.querySelector('.sug-text')?.textContent).toContain('Sintaxe errada');
    });

    it('botão retry deve emitir retryRequested com mensagem correta', () => {
      spyOn(component.retryRequested, 'emit');
      component.agentName = 'Agente Financeiro';
      component.step = { type: 'error', content: 'Err' };
      fixture.detectChanges();
      
      const compiled = fixture.nativeElement as HTMLElement;
      const btn = compiled.querySelector('.retry-btn') as HTMLElement;
      btn.click();
      
      expect(component.retryRequested.emit).toHaveBeenCalledWith(
        'Corrija o erro na consulta SQL do Agente Financeiro e reexecute a análise'
      );
    });
  });

  describe('pipes', () => {
    let hlPipe: HighlightContentPipe;
    let sqlPipe: SqlHighlightPipe;
    let formatPipe: FormatCellPipe;
    let sanitizer: DomSanitizer;

    beforeEach(() => {
      sanitizer = TestBed.inject(DomSanitizer);
      hlPipe = new HighlightContentPipe(sanitizer);
      sqlPipe = new SqlHighlightPipe(sanitizer);
      formatPipe = new FormatCellPipe();
    });

    it('HighlightContentPipe deve destacar R$ em pill vermelho', () => {
      const res = hlPipe.transform('Custo de R$ 1.000,00')?.toString() ?? '';
      expect(res).toContain('<span class="hl-money">R$ 1.000,00</span>');
    });

    it('HighlightContentPipe deve colorir +X% em verde', () => {
      const res = hlPipe.transform('Aumento de +5.2%')?.toString() ?? '';
      expect(res).toContain('<span class="hl-up">+5.2%</span>');
    });

    it('HighlightContentPipe deve colorir -X% em vermelho', () => {
      const res = hlPipe.transform('Queda de -10%')?.toString() ?? '';
      expect(res).toContain('<span class="hl-down">-10%</span>');
    });

    it('FormatCellPipe deve formatar BRL para coluna "value"', () => {
      const res = formatPipe.transform(1000, 'value');
      // toLocaleString with pt-BR and currency BRL results in something like 'R$ 1.000,00' or matching spaces.
      // So we just check if it contains 1.000
      expect(res).toMatch(/1\.000/);
    });

    it('FormatCellPipe deve formatar data para coluna "date"', () => {
      const res = formatPipe.transform('2026-03-29T00:00:00Z', 'date');
      // We expect a short date format depending on timezone, usually '28/03/2026' or '29/03/2026'
      // Just check that it's correctly mapped.
      expect(res).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('FormatCellPipe deve adicionar seta ↑ para variação positiva', () => {
      const res = formatPipe.transform(5.5, 'variacao');
      expect(res).toBe('↑ 5.5%');
    });

    it('FormatCellPipe deve retornar "—" para valor null', () => {
      expect(formatPipe.transform(null, 'name')).toBe('—');
    });

    it('SqlHighlightPipe deve destacar SELECT em azul', () => {
      const res = sqlPipe.transform('SELECT * FROM t')?.toString() ?? '';
      expect(res).toContain('<strong style="color: #1565C0; font-weight: 500;">SELECT</strong>');
    });
  });
});
