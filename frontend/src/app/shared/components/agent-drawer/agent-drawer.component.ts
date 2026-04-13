import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentStep } from '../../../core/agent.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

export interface NodeEntry {
  node: string;
  label: string;
  type: string;
  status: 'done' | 'active' | 'pending';
  detail: Record<string, any>;
  report?: string;
  insights?: string[];
  query_sql?: string;
  row_count?: number;
  latency?: number;
  timestamp?: number;
}

const NODE_ICONS: Record<string, string> = {
  transformer: '🔄',
  planner: '🗂️',
  data_scanner: '🔍',
  categorical_semantic: '📚',
  router: '🚦',
  agente_vendas: '📊',
  agente_financeiro: '💰',
  agente_logistica: '🚚',
  consolidador: '🧩',
  gepa: '✨',
  juiz: '⚖️',
  memorizador: '🧠',
};

@Component({
  selector: 'app-agent-drawer',
  standalone: true,
  imports: [CommonModule, MarkdownPipe],
  template: `
    <!-- BACKDROP -->
    <div class="drawer-backdrop" [class.visible]="open" (click)="close.emit()"></div>

    <!-- DRAWER PANEL -->
    <div class="agent-drawer" [class.open]="open">
      <!-- Header -->
      <div class="drawer-header">
        <div class="drawer-header-main">
          <div class="drawer-title">
            <span class="drawer-icon">🔬</span>
            Monitor de Agentes
            <span class="admin-badge">PLATAFORMA</span>
          </div>
          <div class="drawer-pills">
            <span class="pill done">{{ doneCount }} concluídos</span>
            <span class="pill active" *ngIf="activeNode">1 ativo</span>
          </div>
        </div>
        
        <!-- Rastreabilidade (Trace ID) -->
        <div class="trace-info" *ngIf="sessionId">
          <span class="trace-label">THREAD ID / RASTREABILIDADE</span>
          <code class="trace-id">{{ sessionId }}</code>
        </div>

        <button class="close-x" (click)="close.emit()">✕</button>
      </div>

      <!-- Node Tabs Navigation -->
      <div class="tab-nav">
        <button
          *ngFor="let entry of nodeEntries"
          class="tab-btn"
          [class.selected]="selectedTab === entry.node"
          [class.has-report]="!!entry.report"
          (click)="selectedTab = entry.node"
          [title]="entry.label"
        >
          <span class="tab-icon">{{ getIcon(entry.node) }}</span>
          <span class="tab-name">{{ formatNodeName(entry.node) }}</span>
          <span class="report-dot" *ngIf="entry.report">📄</span>
          <span class="status-dot" [class]="entry.status"></span>
        </button>
      </div>

      <!-- Empty State -->
      <div class="drawer-empty" *ngIf="nodeEntries.length === 0">
        <span>🔬</span>
        <p>Execute uma análise para monitorar os agentes em tempo real.</p>
        <p class="hint">Os relatórios de cada agente aparecerão aqui sem poluir o chat.</p>
      </div>

      <!-- Node Detail Content -->
      <div class="drawer-content" *ngIf="nodeEntries.length > 0">
        <ng-container *ngFor="let entry of nodeEntries">
          <div class="node-panel" *ngIf="selectedTab === entry.node">
            <div class="node-panel-header">
              <span class="node-ico-big">{{ getIcon(entry.node) }}</span>
              <div class="node-header-text">
                <div class="node-name-big">{{ formatNodeName(entry.node) }}</div>
                <div class="node-label">{{ entry.label }}</div>
              </div>
              <div class="node-header-meta">
                <span class="latency-badge" *ngIf="entry.detail['latency']">
                  ⏱️ {{ entry.detail['latency'] | number:'1.2-2' }}s
                </span>
                <span class="badge" [class]="entry.status">
                  {{ entry.status === 'done' ? 'Concluído' : entry.status === 'active' ? 'Executando' : 'Aguardando' }}
                </span>
              </div>
            </div>

            <div class="node-fields">

              <!-- AGENTES ESPECIALISTAS (vendas / financeiro / logística) -->
              <ng-container *ngIf="entry.node.startsWith('agente_')">
                <!-- Resposta Individual do Agente -->
                <div class="field" *ngIf="entry.report">
                  <div class="field-label report-section-label">
                    📋 Resposta Individual: {{ formatNodeName(entry.node) }}
                    <span class="report-chip">INSUMO PARA CONSOLIDAÇÃO</span>
                  </div>
                  <div class="report-markdown-body individual-report" [innerHTML]="entry.report | markdown"></div>
                </div>

                <!-- KPIs -->
                <div class="field kpi-row" *ngIf="entry.row_count !== undefined || entry.insights?.length">
                  <div class="kpi-card" *ngIf="entry.row_count !== undefined">
                    <div class="kpi-val">{{ entry.row_count }}</div>
                    <div class="kpi-label">Linhas Databricks</div>
                  </div>
                  <div class="kpi-card" *ngIf="entry.insights?.length">
                    <div class="kpi-val">{{ entry.insights!.length }}</div>
                    <div class="kpi-label">Insights</div>
                  </div>
                </div>

                <!-- SQL -->
                <div class="field" *ngIf="entry.query_sql">
                  <div class="field-label">Lógica de Extração (SQL)</div>
                  <div class="field-value code">{{ entry.query_sql }}</div>
                </div>

                <!-- Sem dados ainda -->
                <div class="node-empty" *ngIf="!entry.report && !entry.query_sql && entry.row_count === undefined">
                  <span>{{ getIcon(entry.node) }}</span>
                  <p>{{ entry.status === 'active' ? 'Agente processando lógica de domínio...' : 'Aguardando execução' }}</p>
                </div>
              </ng-container>

              <!-- TRANSFORMER -->
              <ng-container *ngIf="entry.node === 'transformer'">
                <div class="field" *ngIf="entry.detail['model_name']">
                  <div class="field-label">Modelo Ativo</div>
                  <div class="field-value model-name">{{ entry.detail['model_name'] }}</div>
                </div>
                <div class="field" *ngIf="entry.detail['query_enriquecida']">
                  <div class="field-label">Query Enriquecida</div>
                  <div class="field-value">{{ entry.detail['query_enriquecida'] }}</div>
                </div>
                <div class="field" *ngIf="entry.detail['hypotheses']">
                  <div class="field-label">Hipóteses de Intenção</div>
                  <div class="field-value mono">{{ entry.detail['hypotheses'] }}</div>
                </div>
                <div class="field" *ngIf="entry.detail['user_preferences']">
                  <div class="field-label">🧠 Memória LTM Aplicada</div>
                  <div class="field-value ltm">{{ entry.detail['user_preferences'] }}</div>
                </div>
              </ng-container>

              <!-- PLANNER -->
              <ng-container *ngIf="entry.node === 'planner'">
                <div class="field" *ngIf="entry.detail['agentes_selecionados']?.length">
                  <div class="field-label">Estratégia: Agentes Convocados</div>
                  <div class="field-pills">
                    <span class="agent-pill highlighted" *ngFor="let a of entry.detail['agentes_selecionados']">
                      {{ a }}
                    </span>
                  </div>
                </div>
                <div class="field" *ngIf="entry.detail['plano_execucao']">
                  <div class="field-label">Plano de Execução Detalhado</div>
                  <div class="field-value planner-plan" [innerHTML]="entry.detail['plano_execucao'] | markdown"></div>
                </div>
              </ng-container>

              <!-- ROUTER -->
              <ng-container *ngIf="entry.node === 'router'">
                <div class="field" *ngIf="entry.detail['agentes_selecionados']?.length">
                  <div class="field-label">Disparo em Paralelo (Fan-out)</div>
                  <div class="field-pills">
                    <span class="agent-pill" *ngFor="let a of entry.detail['agentes_selecionados']">{{ a }}</span>
                  </div>
                </div>
              </ng-container>

              <!-- JUIZ -->
              <ng-container *ngIf="entry.node === 'juiz'">
                <div class="field kpi-row">
                  <div class="kpi-card">
                    <div class="kpi-val verdict"
                         [class.ok]="entry.detail['veredito'] === 'finalizar'"
                         [class.warn]="entry.detail['veredito'] !== 'finalizar'">
                      {{ entry.detail['veredito'] === 'finalizar' ? '✅ Aprovado' : '🔁 Replanejar' }}
                    </div>
                    <div class="kpi-label">Veredito</div>
                  </div>
                  <div class="kpi-card" *ngIf="entry.detail['score_confianca'] !== undefined">
                    <div class="kpi-val">{{ (entry.detail['score_confianca'] * 100) | number: '1.0-0' }}%</div>
                    <div class="kpi-label">Score Confiança</div>
                  </div>
                </div>
              </ng-container>

              <!-- MEMORIZADOR -->
              <ng-container *ngIf="entry.node === 'memorizador'">
                <div class="field" *ngIf="entry.detail['sugestoes']?.length">
                  <div class="field-label">Sugestões de Follow-up (Auto-aprendizado)</div>
                  <div class="sugestoes-list">
                    <div class="sugestao-item" *ngFor="let s of entry.detail['sugestoes']">
                      <span>💡</span> {{ s }}
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- DATA SCANNER -->
              <ng-container *ngIf="entry.node === 'data_scanner'">
                <div class="field" *ngIf="entry.detail['schema_info']">
                  <div class="field-label">Tabelas e Schemas Mapeados</div>
                  <div class="schema-list" *ngFor="let item of entry.detail['schema_info'] | keyvalue">
                    <div class="schema-key"><strong>{{ item.key }}</strong></div>
                    <div class="field-value mono">{{ item.value }}</div>
                  </div>
                </div>
              </ng-container>

              <!-- CATEGORICAL SEMANTIC -->
              <ng-container *ngIf="entry.node === 'categorical_semantic'">
                <div class="field" *ngIf="entry.detail['dicionario_categorico']">
                  <div class="field-label">Dicionário de Categorias Identificado</div>
                  <div class="schema-list" *ngFor="let item of entry.detail['dicionario_categorico'] | keyvalue">
                    <div class="schema-key"><strong>{{ item.key }}</strong></div>
                    <div class="field-pills">
                      <span class="agent-pill" *ngFor="let val of $any(item.value).valores_vistos">{{ val }}</span>
                    </div>
                  </div>
                </div>
              </ng-container>

              <!-- CONSOLIDADOR -->
              <ng-container *ngIf="entry.node === 'consolidador'">
                <div class="field" *ngIf="entry.detail['consolidacao_final']">
                  <div class="field-label">Merge Final e Síntese</div>
                  <div class="field-value planner-plan" [innerHTML]="entry.detail['consolidacao_final'] | markdown"></div>
                </div>
              </ng-container>

              <!-- GEPA (Anti-Bias) -->
              <ng-container *ngIf="entry.node === 'gepa'">
                <div class="field kpi-row">
                  <div class="kpi-card" *ngIf="entry.detail['score_confianca'] !== undefined">
                    <div class="kpi-val"
                         [class.ok]="entry.detail['score_confianca'] >= 0.8"
                         [class.warn]="entry.detail['score_confianca'] < 0.8">
                      {{ (entry.detail['score_confianca'] * 100) | number: '1.0-0' }}%
                    </div>
                    <div class="kpi-label">Score GEPA</div>
                  </div>
                </div>
                <div class="field" *ngIf="entry.detail['feedback_gepa']">
                  <div class="field-label">Análise de Viés e Alucinação</div>
                  <div class="field-value planner-plan" [innerHTML]="entry.detail['feedback_gepa'] | markdown"></div>
                </div>
              </ng-container>

              <!-- GENÉRICO -->
              <ng-container *ngIf="!entry.node.startsWith('agente_') && !['transformer','planner','router','juiz','memorizador','data_scanner','categorical_semantic','consolidador','gepa'].includes(entry.node)">
                <div class="node-empty">
                  <span>{{ getIcon(entry.node) }}</span>
                  <p>{{ entry.label }}</p>
                  <p class="entry-status-text done-text" *ngIf="entry.status === 'done'">Finalizado com sucesso ✓</p>
                </div>
              </ng-container>

            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styleUrls: ['./agent-drawer.component.scss']
})
export class AgentDrawerComponent implements OnChanges {
  @Input() open = false;
  @Input() steps: AgentStep[] = [];
  @Input() activeNode: string | null = null;
  @Input() sessionId: string | null = null;
  @Output() close = new EventEmitter<void>();

  selectedTab: string = '';
  nodeEntries: NodeEntry[] = [];

  private readonly ALL_NODES = [
    'transformer', 'planner', 'data_scanner', 'categorical_semantic',
    'router', 'agente_vendas', 'agente_financeiro', 'agente_logistica',
    'consolidador', 'gepa', 'juiz', 'memorizador'
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['steps'] || changes['activeNode']) {
      this.buildNodeEntries();
    }
  }

  private buildNodeEntries() {
    // Indexar steps com node_detail por nó
    const stepsByNode: Record<string, AgentStep> = {};
    for (const step of this.steps) {
      if (step.node_detail?.['node']) {
        stepsByNode[step.node_detail['node']] = step;
      }
    }

    // Indexar agent_report steps por agent_id (relatório completo do agente)
    const reportByAgent: Record<string, AgentStep> = {};
    for (const step of this.steps) {
      if (step.type === 'agent_report' && step.agent_id) {
        reportByAgent[step.agent_id] = step;
      }
    }

    this.nodeEntries = this.ALL_NODES
      .map(n => {
        const step = stepsByNode[n];
        const reportStep = reportByAgent[n];

        let status: 'done' | 'active' | 'pending' = 'pending';
        if (n === this.activeNode) status = 'active';
        else if (step || reportStep) status = 'done';

        const detail = step?.node_detail || {};

        return {
          node: n,
          label: detail['label'] || this.formatNodeName(n),
          type: detail['type'] || 'action',
          status,
          detail,
          report: reportStep?.content || undefined,
          insights: reportStep?.metadata?.['insights'] || detail['insights'] || [],
          query_sql: reportStep?.metadata?.['query_sql'] || detail['query_sql'] || '',
          row_count: reportStep?.metadata?.['row_count'] ?? detail['row_count'] ?? undefined,
          latency: detail['latency'],
          timestamp: detail['timestamp'],
        };
      });

    // FIX: Reset selectedTab quando steps foram limpos (nova query iniciada)
    const tabStillExists = this.nodeEntries.some(e => e.node === this.selectedTab);
    if (!tabStillExists) {
      this.selectedTab = '';
    }

    // Auto-seguir nó ativo enquanto streaming (apenas se drawer está aberto)
    if (this.activeNode && this.open) {
      this.selectedTab = this.activeNode;
      return;
    }

    // Selecionar aba inteligente:
    // 1. Prioridade: primeira aba com relatório de agente (conteúdo mais rico)
    // 2. Fallback: primeiro nó disponível
    if (!this.selectedTab) {
      const withReport = this.nodeEntries.find(e => e.report);
      this.selectedTab = withReport?.node || this.nodeEntries[0]?.node || '';
    }
  }

  get doneCount() {
    return this.nodeEntries.filter(e => e.status === 'done').length;
  }

  getIcon(node: string): string {
    return NODE_ICONS[node] || '⚙️';
  }

  formatNodeName(node: string): string {
    return node.replace('agente_', '').replace(/_/g, ' ')
      .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}
