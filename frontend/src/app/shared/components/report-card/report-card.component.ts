import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentStep } from '../../../core/agent.service';
import { ReportStructured } from '../../../core/report.models';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { ReportTableComponent } from '../report-table/report-table.component';

/**
 * ReportCardComponent — renderizador principal de relatórios dos agentes.
 *
 * Substitui o AgentBubbleComponent para mensagens do tipo 'complete' e
 * 'agent_report'. Detecta automaticamente se o step possui um relatório
 * estruturado (step.report) ou renderiza o conteúdo como markdown (fallback).
 *
 * Seções suportadas:
 *   narrative    → texto com MarkdownPipe
 *   table        → app-report-table
 *   action_list  → lista numerada com título + descrição
 *   conclusion   → box de conclusão com borda esquerda vermelha
 */
@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule, MarkdownPipe, ReportTableComponent],
  templateUrl: './report-card.component.html',
  styleUrls: ['./report-card.component.scss']
})
export class ReportCardComponent {
  /** Step do SSE que contém o conteúdo e o relatório estruturado. */
  @Input() step!: AgentStep;

  /** Nome do agente para exibição no header quando não há relatório estruturado. */
  @Input() agentName: string = '';

  /** Cor hex do avatar do agente (ex: '#EC0000'). */
  @Input() agentColor: string = '#EC0000';

  /** Tipo do ícone SVG do agente. */
  @Input() agentIconType: string = 'cpu';

  /** Horário da resposta para exibição. */
  @Input() timestamp: string = '';

  // ─────────────────────────────────────────────────────────────────────────
  // DETECÇÃO DE MODO DE RENDERIZAÇÃO
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Indica se o step possui um relatório estruturado válido.
   * Quando false, renderiza step.content via MarkdownPipe como fallback.
   */
  get hasStructuredReport(): boolean {
    return (this.step?.report?.sections?.length ?? 0) > 0;
  }

  /** Acessa o relatório estruturado de forma segura. */
  get report(): ReportStructured | null {
    return this.step?.report ?? null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCORE DE CONFIANÇA
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retorna a cor da barra de score de confiança.
   * Verde >= 0.8, Âmbar >= 0.6, Vermelho < 0.6.
   */
  getScoreColor(score: number): string {
    if (score >= 0.8) return '#43A047';
    if (score >= 0.6) return '#F57F17';
    return '#EC0000';
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DADOS DO AGENTE (para o caso de fallback com agent_report)
  // ─────────────────────────────────────────────────────────────────────────

  /** Cor do agente baseada no agent_id no step. */
  get agentColorResolved(): string {
    if (this.agentColor && this.agentColor !== '#EC0000') return this.agentColor;
    const agentId = this.step?.agent_id ?? '';
    const mapa: Record<string, string> = {
      agente_financeiro: '#1565C0',
      agente_vendas:     '#EC0000',
      agente_logistica:  '#2E7D32',
    };
    return mapa[agentId] ?? '#7B1FA2';
  }

  /** Nome legível do agente. */
  get agentNameResolved(): string {
    if (this.agentName) return this.agentName;
    return (this.step?.agent_id ?? 'Agente')
      .replace('agente_', '').replace(/_/g, ' ')
      .split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}
