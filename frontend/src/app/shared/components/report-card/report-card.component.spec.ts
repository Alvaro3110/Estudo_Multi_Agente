/**
 * Testes do ReportCardComponent.
 * Executar: ng test --include='**/report-card.component.spec.ts' --watch=false
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportCardComponent } from './report-card.component';
import { AgentStep } from '../../../core/agent.service';
import { ReportStructured } from '../../../core/report.models';

const mockReport: ReportStructured = {
  title: 'Relatório de Vendas — out/2025',
  badge_text: 'Análise concluída',
  badge_variant: 'ok',
  sections: [
    {
      type: 'narrative',
      label: 'resumo executivo',
      content: 'RJ lidera com **R$ 1,68 bi** em receita.',
    },
    {
      type: 'action_list',
      label: 'ações recomendadas',
      items: [
        { title: 'Expandir portfólio', description: 'Adicionar linha premium em SP.' },
      ],
    },
    {
      type: 'conclusion',
      label: 'conclusão',
      content: 'Foco em eficiência operacional.',
    },
  ],
  score_confianca: 0.85,
  row_count: 2,
  generated_at: '14:30',
};

const mockStepComReport: AgentStep = {
  type: 'complete',
  content: 'Análise concluída.',
  report: mockReport,
};

const mockStepSemReport: AgentStep = {
  type: 'complete',
  content: '# Relatório\n\nTexto em **markdown**.',
};

describe('ReportCardComponent', () => {
  let component: ReportCardComponent;
  let fixture: ComponentFixture<ReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportCardComponent);
    component = fixture.componentInstance;
  });

  // ─── Detecção de modo ─────────────────────────────────────────────────────

  it('com step.report → hasStructuredReport = true', () => {
    component.step = mockStepComReport;
    fixture.detectChanges();
    expect(component.hasStructuredReport).toBeTrue();
  });

  it('sem step.report → hasStructuredReport = false', () => {
    component.step = mockStepSemReport;
    fixture.detectChanges();
    expect(component.hasStructuredReport).toBeFalse();
  });

  it('com step.report.sections vazio → hasStructuredReport = false', () => {
    component.step = {
      ...mockStepComReport,
      report: { ...mockReport, sections: [] },
    };
    fixture.detectChanges();
    expect(component.hasStructuredReport).toBeFalse();
  });

  // ─── Renderização das seções ──────────────────────────────────────────────

  it('seção narrative → renderiza div.rc-narrative', () => {
    component.step = mockStepComReport;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.rc-narrative')).toBeTruthy();
  });

  it('seção action_list → renderiza lista .action-list', () => {
    component.step = mockStepComReport;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.action-list')).toBeTruthy();
  });

  it('seção action_list → contém item numerado', () => {
    component.step = mockStepComReport;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const numBadge = el.querySelector('.action-num');
    expect(numBadge?.textContent?.trim()).toBe('1');
  });

  it('seção conclusion → renderiza div.conclusion-box', () => {
    component.step = mockStepComReport;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.conclusion-box')).toBeTruthy();
  });

  it('sem relatório estruturado → renderiza rc-narrative com step.content', () => {
    component.step = mockStepSemReport;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.rc-narrative')).toBeTruthy();
    expect(el.querySelector('.action-list')).toBeNull();
  });

  // ─── Header ───────────────────────────────────────────────────────────────

  it('exibe report.title quando presente', () => {
    component.step = mockStepComReport;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.rc-agent-name')?.textContent)
      .toContain('Relatório de Vendas');
  });

  it('exibe agentName como fallback quando report.title ausente', () => {
    component.step = mockStepSemReport;
    component.agentName = 'Agente de Vendas';
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.rc-agent-name')?.textContent)
      .toContain('Agente de Vendas');
  });

  it('badge com badge_variant ok → classe badge-ok', () => {
    component.step = mockStepComReport;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.rc-badge');
    expect(badge?.classList).toContain('badge-ok');
  });

  it('badge com badge_variant warn → classe badge-warn', () => {
    component.step = {
      ...mockStepComReport,
      report: { ...mockReport, badge_variant: 'warn' },
    };
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.rc-badge');
    expect(badge?.classList).toContain('badge-warn');
  });

  it('badge com badge_variant error → classe badge-error', () => {
    component.step = {
      ...mockStepComReport,
      report: { ...mockReport, badge_variant: 'error' },
    };
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.rc-badge');
    expect(badge?.classList).toContain('badge-error');
  });

  // ─── Footer ───────────────────────────────────────────────────────────────

  it('footer renderizado quando score_confianca presente', () => {
    component.step = mockStepComReport;
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.rc-footer');
    expect(footer).toBeTruthy();
  });

  it('footer oculto quando score e row_count ausentes', () => {
    component.step = {
      ...mockStepComReport,
      report: { ...mockReport, score_confianca: undefined, row_count: undefined },
    };
    fixture.detectChanges();
    const footer = fixture.nativeElement.querySelector('.rc-footer');
    expect(footer).toBeNull();
  });

  it('footer exibe row_count formatado', () => {
    component.step = mockStepComReport;
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.rc-rows')?.textContent).toContain('2');
  });

  // ─── getScoreColor ─────────────────────────────────────────────────────────

  it('score >= 0.8 → cor verde', () => {
    component.step = mockStepSemReport;
    expect(component.getScoreColor(0.85)).toBe('#43A047');
  });

  it('score 0.6-0.79 → cor âmbar', () => {
    component.step = mockStepSemReport;
    expect(component.getScoreColor(0.7)).toBe('#F57F17');
  });

  it('score < 0.6 → cor vermelha', () => {
    component.step = mockStepSemReport;
    expect(component.getScoreColor(0.4)).toBe('#EC0000');
  });
});
