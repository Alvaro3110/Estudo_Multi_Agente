import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentStep } from '../../../core/agent.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { SqlHighlightPipe } from '../../pipes/sql-highlight.pipe';
import { FormatCellPipe } from '../../pipes/format-cell.pipe';

@Component({
  selector: 'app-agent-bubble',
  standalone: true,
  imports: [CommonModule, MarkdownPipe, SqlHighlightPipe, FormatCellPipe],
  styleUrls: ['./agent-bubble.component.scss'],
  template: `
    <div class="report" *ngIf="step">
      
      <!-- ESTADO DE SUCESSO OU OUTROS (EXCETO ERRO) -->
      <ng-container *ngIf="!isError">
        <!-- 2.1 Header (sempre presente) -->
        <div class="rh">
          <div class="rh-ava" [style.background]="agentColor">
            <!-- Icon placeholder base on input, real implementation uses app-agent-icon if available -->
            <svg *ngIf="agentIcon === 'dollar'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <svg *ngIf="agentIcon === 'trend'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <svg *ngIf="agentIcon === 'layers'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg>
            <svg *ngIf="agentIcon === 'cpu'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
          </div>
          <div class="rh-info">
            <div class="rh-name" [style.color]="agentColor">
              {{ agentName }}
              <span class="rh-time">{{ timestamp }}</span>
            </div>
            <div class="rh-title">
              {{ step.content | slice:0:60 }}{{ step.content.length > 60 ? '…' : '' }}
            </div>
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

        <!-- 2.2 Narrativa com highlights automáticos -->
        <div class="rc-narrative" *ngIf="hasNarrative"
          [innerHTML]="step.content | markdown">
        </div>

        <!-- 2.3 Tabela dinâmica com dados reais -->
        <ng-container *ngIf="hasTable">
          <div class="divider"></div>
          <div class="section-title">
            dados extraídos · {{ step.metadata?.['row_count'] | number }} registros
          </div>
          <div class="tbl-wrap">
            <table class="data-tbl">
              <thead>
                <tr>
                  <th *ngFor="let col of tableColumns">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let row of showAllRows ? (step.metadata?.['dados'] ?? []) : tableRows">
                  <td *ngFor="let col of tableColumns"
                    [ngClass]="getCellClass(col, row[col])">
                    {{ row[col] | formatCell:col }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="tbl-footer" *ngIf="hasMoreRows && !showAllRows">
            <button (click)="showAllRows = true">
              ver todas as {{ extraRows }} linhas restantes
            </button>
          </div>
        </ng-container>

        <!-- 2.4 Query SQL colapsável -->
        <ng-container *ngIf="hasSql">
          <div class="sql-toggle" (click)="sqlExpanded = !sqlExpanded">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            <span>consulta sql executada</span>
            <svg class="arrow" [class.expanded]="sqlExpanded" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div class="sql-body" *ngIf="sqlExpanded"
            [innerHTML]="step.metadata?.['query_sql'] | sqlHighlight">
          </div>
        </ng-container>

        <!-- 2.5 Insights com dot colorido automático -->
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

        <!-- 2.6 Score de confiança (GEPA) -->
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
        </div>
      </ng-container>

      <!-- PARTE 3 — TEMPLATE ESTADO DE ERRO -->
      <ng-container *ngIf="isError">
        <div class="rh">
          <div class="rh-ava" [style.background]="agentColor">
            <svg *ngIf="agentIcon === 'dollar'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <svg *ngIf="agentIcon === 'trend'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <svg *ngIf="agentIcon === 'layers'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg>
            <svg *ngIf="agentIcon === 'cpu'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
          </div>
          <div class="rh-info">
            <div class="rh-name" [style.color]="agentColor">
              {{ agentName }}
              <span class="rh-time">{{ timestamp }}</span>
            </div>
            <div class="rh-title">
              Erro na extração de dados
            </div>
          </div>
          <div class="badge badge-err">falha na extração</div>
        </div>

        <div class="err-banner">
          <div class="err-ico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
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
            <div class="sql-code"
              [innerHTML]="step.metadata?.['query_sql'] | sqlHighlight">
            </div>
          </div>
        </ng-container>

        <div class="suggestion" *ngIf="hasInsights">
          <div class="sug-ico">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          </div>
          <div class="sug-text">
            <b>Sugestão do agente:</b>
            {{ step.metadata?.['insights']?.[0] }}
          </div>
        </div>

        <button class="retry-btn" (click)="onRetry()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
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

  get hasNarrative(): boolean {
    return !!this.step?.content?.trim();
  }

  get hasTable(): boolean {
    const dados = this.step?.metadata?.['dados'] as any[];
    return (dados?.length ?? 0) > 0;
  }

  get hasSql(): boolean {
    return !!this.step?.metadata?.['query_sql']?.trim();
  }

  get hasInsights(): boolean {
    const insights = this.step?.metadata?.['insights'] as any[];
    return (insights?.length ?? 0) > 0;
  }

  get hasScore(): boolean {
    return (this.step?.metadata?.['score_confianca'] ?? 0) > 0;
  }

  get isError(): boolean {
    return this.step?.type === 'error';
  }

  get tableColumns(): string[] {
    const dados = this.step?.metadata?.['dados'] as Record<string, unknown>[];
    if (!dados?.length) return [];
    return Object.keys(dados[0]).slice(0, 8); // máximo 8 colunas
  }

  get tableRows(): Record<string, unknown>[] {
    const dados = this.step?.metadata?.['dados'] as Record<string, unknown>[];
    return dados?.slice(0, 10) ?? []; // máximo 10 linhas
  }

  get hasMoreRows(): boolean {
    const dados = this.step?.metadata?.['dados'] as Record<string, unknown>[];
    return (dados?.length ?? 0) > 10;
  }

  get extraRows(): number {
    const dados = this.step?.metadata?.['dados'] as Record<string, unknown>[];
    return (dados?.length ?? 0) - 10;
  }

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

  getCellClass(col: string, val: unknown): string {
    const colName = col.toLowerCase();
    
    // Se col contém 'var'|'change'|'delta'|'variacao':
    if (/var|change|delta|variacao/.test(colName)) {
      const num = Number(val);
      if (!isNaN(num)) {
        if (num > 0) return 'cell-up';
        if (num < 0) return 'cell-down';
      }
    }
    
    // Se col === 'status'|'estado'|'situacao':
    if (['status', 'estado', 'situacao'].includes(colName)) {
      return 'cell-status';
    }
    
    return '';
  }

  getInsightColor(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Palavras positivas
    if (/crescimento|aumento|superou|acima|melhora|record/.test(lowerText)) {
      return '#43A047';
    }
    // Palavras negativas
    if (/queda|risco|alerta|abaixo|critico|falha/.test(lowerText)) {
      return '#EC0000';
    }
    // Palavras de atenção
    if (/atenção|monitorar|revisar|moderado|pendente/.test(lowerText)) {
      return '#F57F17';
    }
    
    return '#1E88E5'; // Default
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
