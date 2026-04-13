import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentStep } from '../../../core/agent.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { SqlHighlightPipe } from '../../pipes/sql-highlight.pipe';
import {
  MarkdownParserService,
  ContentBlock, ParsedTable, ActionItem
} from '../../../core/markdown-parser.service';
import { ReportTableComponent } from '../report-table/report-table.component';

/**
 * Componente de bolha de relatório de agente.
 * Usa MarkdownParserService para dividir o content em blocos tipados,
 * prioriza metadata.dados (dados reais do Databricks) sobre tabelas
 * detecadas no markdown, e aplica cleanRepeatedText antes de renderizar.
 */
@Component({
  selector: 'app-agent-bubble',
  standalone: true,
  imports: [CommonModule, MarkdownPipe, SqlHighlightPipe, ReportTableComponent],
  styleUrls: ['./agent-bubble.component.scss'],
  template: `
    <div class="report" *ngIf="step">

      <!-- ══════════════════════════════════════════════════════════════
           TEMPLATE DE SUCESSO
           ══════════════════════════════════════════════════════════════ -->
      <ng-container *ngIf="!isError">

        <!-- HEADER -->
        <div class="rh">
          <div class="rh-ava" [style.background]="agentColor">
            <svg *ngIf="agentIcon === 'dollar'" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            <svg *ngIf="agentIcon === 'trend'" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <svg *ngIf="agentIcon === 'layers'" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 12 12 17 22 12"></polyline>
              <polyline points="2 17 12 22 22 17"></polyline>
            </svg>
            <svg *ngIf="agentIcon === 'cpu'" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
          </div>
          <div class="rh-info">
            <div class="rh-name" [style.color]="agentColor">
              {{ agentName }}
              <span class="rh-time">{{ timestamp }}</span>
            </div>
            <div class="rh-title">{{ reportTitle }}</div>
          </div>
          <div class="badge"
            [class.badge-ok]="(step.metadata?.['row_count'] ?? 0) > 0"
            [class.badge-empty]="step.metadata?.['row_count'] === 0">
            <ng-container *ngIf="(step.metadata?.['row_count'] ?? 0) > 0">
              concluído · {{ step.metadata?.['row_count'] | number }} registros
            </ng-container>
            <ng-container *ngIf="step.metadata?.['row_count'] === 0">
              sem dados retornados
            </ng-container>
          </div>
        </div>

        <!-- BLOCOS DE NARRATIVA (somente blocos markdown do conteúdo) -->
        <ng-container *ngFor="let block of narrativeBlocks">
          <div class="rc-narrative"
               *ngIf="hasVisibleText(block.content)"
               [innerHTML]="(block.content || '') | markdown">
          </div>
        </ng-container>

        <!-- TABELA DE DADOS REAIS (metadata.dados tem prioridade) -->
        <ng-container *ngIf="hasTable">
          <div class="divider"></div>
          <div class="section-title">dados extraídos · Databricks</div>
          <app-report-table
            [table]="dataTable!"
            [title]="dataTable?.title"
            [rowCount]="step.metadata?.['row_count']"
            [source]="dataTable?.source">
          </app-report-table>
          <div class="tbl-footer" *ngIf="hasMoreRows && !showAllRows">
            <button (click)="showAllRows = true">
              ver todas as {{ extraRows }} linhas restantes
            </button>
          </div>
        </ng-container>

        <!-- TABELAS PARSEADAS DO MARKDOWN (fallback quando não há metadata.dados) -->
        <ng-container *ngIf="!hasTable">
          <ng-container *ngFor="let block of markdownTableBlocks">
            <div class="divider"></div>
            <div class="section-title">tabela extraída do relatório</div>
            <app-report-table [table]="block.table!"></app-report-table>
          </ng-container>
        </ng-container>

        <!-- QUERY SQL COLAPSÁVEL -->
        <ng-container *ngIf="hasSql">
          <div class="sql-toggle" (click)="sqlExpanded = !sqlExpanded">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            <span>consulta sql executada</span>
            <svg class="arrow" [class.expanded]="sqlExpanded" width="14" height="14"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
          <div class="sql-body" *ngIf="sqlExpanded"
               [innerHTML]="step.metadata?.['query_sql'] | sqlHighlight">
          </div>
        </ng-container>

        <!-- INSIGHTS COM DOT COLORIDO -->
        <ng-container *ngIf="hasInsights">
          <div class="divider"></div>
          <div class="section-title">insights do agente</div>
          <div class="insights">
            <div class="ins-row" *ngFor="let ins of step.metadata?.['insights']">
              <div class="ins-dot" [style.background]="getInsightColor(ins)"></div>
              <span>{{ ins }}</span>
            </div>
          </div>
        </ng-container>

        <!-- AÇÕES RECOMENDADAS (extraídas do markdown) -->
        <ng-container *ngIf="actionItems.length > 0">
          <div class="divider"></div>
          <div class="section-title">ações recomendadas</div>
          <div class="action-list">
            <div class="action-item" *ngFor="let a of actionItems; let i = index">
              <div class="action-num">{{ i + 1 }}</div>
              <div class="action-body">
                <div class="action-title">{{ a.title }}</div>
                <div class="action-desc" *ngIf="a.description">{{ a.description }}</div>
              </div>
            </div>
          </div>
        </ng-container>

        <!-- FOOTER: score de confiança + total de registros -->
        <div class="score-footer" *ngIf="hasScore">
          <span class="score-label">confiança do agente</span>
          <div class="score-track">
            <div class="score-fill"
                 [style.width.%]="((step.metadata?.['score_confianca'] ?? 0) * 100)"
                 [style.background]="getScoreColor(step.metadata?.['score_confianca'] ?? 0)">
            </div>
          </div>
          <span class="score-val" [style.color]="getScoreColor(step.metadata?.['score_confianca'] ?? 0)">
            {{ ((step.metadata?.['score_confianca'] ?? 0) * 100) | number:'1.0-0' }}%
          </span>
          <div class="score-sep"></div>
          <span class="score-rows" *ngIf="hasTable">
            {{ step.metadata?.['row_count'] | number }} registros analisados
          </span>
          <div class="score-sep" *ngIf="hasTable"></div>
          <span class="score-rows" style="color:#2E7D32">dados reais · Databricks</span>
        </div>

      </ng-container>

      <!-- ══════════════════════════════════════════════════════════════
           TEMPLATE DE ERRO
           ══════════════════════════════════════════════════════════════ -->
      <ng-container *ngIf="isError">
        <div class="rh">
          <div class="rh-ava" [style.background]="agentColor">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="rh-info">
            <div class="rh-name" [style.color]="agentColor">{{ agentName }}
              <span class="rh-time">{{ timestamp }}</span>
            </div>
            <div class="rh-title">Erro na extração de dados</div>
          </div>
          <div class="badge badge-err">falha na extração</div>
        </div>

        <div class="err-banner">
          <div class="err-ico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="err-body">
            <div class="err-title">Erro na consulta ao Databricks</div>
            <div class="err-msg" [innerHTML]="step.content | markdown"></div>
          </div>
        </div>

        <ng-container *ngIf="hasSql">
          <div class="sql-block">
            <div class="sql-header">
              <span class="sql-label">consulta tentada</span>
            </div>
            <div class="sql-code" [innerHTML]="step.metadata?.['query_sql'] | sqlHighlight"></div>
          </div>
        </ng-container>

        <div class="suggestion" *ngIf="hasInsights">
          <div class="sug-ico">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="sug-text">
            <b>Sugestão do agente:</b> {{ step.metadata?.['insights']?.[0] }}
          </div>
        </div>

        <button class="retry-btn" (click)="onRetry()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round">
            <polyline points="1 4 1 10 7 10"></polyline>
            <polyline points="23 20 23 14 17 14"></polyline>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
          </svg>
          Corrigir e reexecutar ↗
        </button>
      </ng-container>

    </div>
  `
})
export class AgentBubbleComponent {
  @Input() step!: AgentStep;
  @Input() agentName: string = '';
  @Input() agentType: string = '';
  @Input() timestamp: string = '';

  @Output() retryRequested = new EventEmitter<string>();

  showAllRows = false;
  sqlExpanded = false;

  constructor(private parser: MarkdownParserService) {}

  // ─── CONTEÚDO LIMPO E PARSEADO ──────────────────────────────────────────

  /** Conteúdo com texto repetido removido. */
  get cleanContent(): string {
    return this.parser.cleanRepeatedText(this.step?.content ?? '');
  }

  /** Todos os blocos parseados do conteúdo limpo. */
  get allBlocks(): ContentBlock[] {
    return this.parser.parseContent(this.cleanContent);
  }

  /** Blocos de texto narrativo (sem tabelas detectadas no markdown). */
  get narrativeBlocks(): ContentBlock[] {
    return this.allBlocks.filter(b => b.type === 'markdown');
  }

  /** Blocos de tabelas detectadas no markdown (fallback). */
  get markdownTableBlocks(): ContentBlock[] {
    return this.allBlocks.filter(b => b.type === 'table');
  }

  /** Ações recomendadas extraídas do markdown. */
  get actionItems(): ActionItem[] {
    return this.parser.extractActions(this.cleanContent);
  }

  /** Título do relatório (H1 ou nome do agente). */
  get reportTitle(): string {
    const h1 = this.step?.content?.match(/^#\s+(.+)$/m)?.[1];
    return h1 || this.agentName;
  }

  // ─── TABELA DOS DADOS REAIS ──────────────────────────────────────────────

  /** Tabela construída a partir de metadata.dados (prioridade sobre markdown). */
  get dataTable(): ParsedTable | null {
    const dados = this.step?.metadata?.['dados'] as Record<string, unknown>[] | undefined;
    if (!dados?.length) return null;

    // Se showAllRows, usa todos; se não, apenas os primeiros 10
    const slice = this.showAllRows ? dados : dados.slice(0, 10);
    return this.parser.buildTableFromDados(slice);
  }

  get hasTable(): boolean      { return !!this.dataTable; }

  get hasMoreRows(): boolean {
    const dados = this.step?.metadata?.['dados'] as unknown[] | undefined;
    return (dados?.length ?? 0) > 10;
  }

  get extraRows(): number {
    const dados = this.step?.metadata?.['dados'] as unknown[] | undefined;
    return Math.max(0, (dados?.length ?? 0) - 10);
  }

  // ─── FLAGS ────────────────────────────────────────────────────────────────

  get hasSql():      boolean { return !!this.step?.metadata?.['query_sql']?.trim(); }
  get hasInsights(): boolean { return ((this.step?.metadata?.['insights'] as unknown[])?.length ?? 0) > 0; }
  get hasScore():    boolean { return (this.step?.metadata?.['score_confianca'] ?? 0) > 0; }
  get isError():     boolean { return this.step?.type === 'error'; }

  // ─── CORES E ÍCONES ───────────────────────────────────────────────────────

  get agentColor(): string {
    const map: Record<string, string> = {
      financeiro: '#1565C0',
      vendas:     '#EC0000',
      logistica:  '#2E7D32',
    };
    return map[this.agentType] ?? '#7B1FA2';
  }

  get agentIcon(): string {
    const map: Record<string, string> = {
      financeiro: 'dollar',
      vendas:     'trend',
      logistica:  'layers',
    };
    return map[this.agentType] ?? 'cpu';
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  /**
   * Verifica se o bloco de texto tem conteúdo visível além de headings e marcadores.
   * Evita renderizar seções que só contêm título H2 sem texto.
   */
  hasVisibleText(content?: string): boolean {
    if (!content) return false;
    const stripped = content
      .replace(/^#+\s.*/gm, '')
      .replace(/^\s*[-*]\s*/gm, '')
      .trim();
    return stripped.length > 10;
  }

  getInsightColor(text: string): string {
    const t = text.toLowerCase();
    if (/crescimento|aumento|superou|acima|melhora|record|lider/.test(t)) return '#43A047';
    if (/queda|risco|alerta|abaixo|critico|falha/.test(t))                return '#EC0000';
    if (/atencao|atenção|monitorar|revisar|moderado|pendente/.test(t))    return '#F57F17';
    return '#1E88E5';
  }

  getScoreColor(score: number): string {
    if (score >= 0.8) return '#43A047';
    if (score >= 0.6) return '#F57F17';
    return '#EC0000';
  }

  onRetry(): void {
    const msg = `Corrija o erro na consulta SQL do ${this.agentName} e reexecute a análise`;
    this.retryRequested.emit(msg);
  }
}
