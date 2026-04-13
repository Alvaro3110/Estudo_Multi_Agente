/**
 * Modelos TypeScript para relatórios estruturados.
 * Espelho dos schemas Pydantic definidos no backend (app/schemas/agent.py).
 * Usados pelo ReportCardComponent e ReportTableComponent.
 */

/** Coluna tipada de uma tabela estruturada. */
export interface TableColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'percent' | 'delta' | 'region' | 'status';
  align: 'left' | 'right' | 'center';
  group?: string;
  group_color?: string;
  width?: string;
  sortable: boolean;
  show_sparkline: boolean;
}

/** Tabela estruturada com dados reais do Databricks. */
export interface ReportTable {
  title: string;
  subtitle?: string;
  source_table?: string;
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  hasGroups?: boolean;
  delta_row?: Record<string, unknown>;
  total_row?: Record<string, unknown>;
  legend?: { color: string; label: string }[];
}

/** Seção tipada dentro de um relatório estruturado. */
export interface ReportSection {
  type: 'narrative' | 'table' | 'action_list' | 'conclusion' | 'kpi_strip' | 'farol';
  label?: string;
  content?: string;
  table?: ReportTable;
  items?: { title: string; description: string }[];
  kpis?: Record<string, unknown>[];
}

/** Relatório completo estruturado emitido no evento 'complete' do SSE. */
export interface ReportStructured {
  title: string;
  badge_text?: string;
  badge_variant: 'ok' | 'warn' | 'error';
  sections: ReportSection[];
  score_confianca?: number;
  row_count?: number;
  source_warning?: string;
  generated_at?: string;
}
