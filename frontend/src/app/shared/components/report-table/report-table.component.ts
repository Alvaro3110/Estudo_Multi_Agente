import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ParsedTable, ParsedColumn, ColumnType
} from '../../../core/markdown-parser.service';

/**
 * Componente de tabela reutilizável que aceita um ParsedTable tipado.
 * Suporta: grupos de colunas, pills de região, badges de delta, ordenação, CSV export.
 */
@Component({
  selector: 'app-report-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-table.component.html',
  styleUrls: ['./report-table.component.scss']
})
export class ReportTableComponent implements OnChanges {
  @Input() table!: ParsedTable;
  @Input() title?: string;
  @Input() rowCount?: number;
  @Input() source?: string;

  /** Linhas ordenadas (reordenadas ao clicar no cabeçalho). */
  sortedRows: Record<string, any>[] = [];

  /** Chave da coluna atualmente usada na ordenação. */
  sortKey = '';

  /** Direção de ordenação: false = decrescente (padrão ao clicar). */
  sortAsc = false;

  ngOnChanges(): void {
    this.sortedRows = [...(this.table?.rows ?? [])];
    this.sortKey = '';
    this.sortAsc = false;
  }

  // ─── FORMATAÇÃO DE CÉLULAS ───────────────────────────────────────────────

  /**
   * Formata um valor de célula de acordo com o tipo da coluna.
   * NUNCA exibe float bruto — todos os números passam aqui.
   */
  formatCell(value: string, type: ColumnType): string {
    if (!value || value === '-' || value === '—' || value.trim() === '') return '—';

    switch (type) {
      case 'currency': {
        // Limpa R$, pontos de milhar e converte vírgula decimal
        const clean = value
          .replace(/R\$\s?/g, '')
          .replace(/\./g, '')
          .replace(',', '.');
        const num = parseFloat(clean);
        if (isNaN(num)) return value;

        // Abreviação para valores grandes
        if (num >= 1_000_000_000)
          return `R$ ${(num / 1_000_000_000).toFixed(1)}B`;
        if (num >= 1_000_000)
          return `R$ ${(num / 1_000_000).toFixed(1)}M`;
        return num.toLocaleString('pt-BR', {
          style: 'currency', currency: 'BRL', maximumFractionDigits: 0
        });
      }

      case 'number': {
        const clean = value.replace(/\./g, '').replace(',', '.');
        const num   = parseFloat(clean);
        if (isNaN(num)) return value;
        return num.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
      }

      case 'percent':
        return value.includes('%') ? value : `${value}%`;

      case 'delta':
        return value; // exibido pelo badge (cor), não precisa formatar

      default:
        return value;
    }
  }

  /**
   * Classe CSS para badge de delta (positivo / negativo / neutro).
   */
  getDeltaClass(value: string): string {
    if (!value) return 'delta-neutral';
    const clean = value.replace(/[^0-9+\-.,]/g, '');
    const num   = parseFloat(clean.replace(',', '.'));
    if (isNaN(num)) return 'delta-neutral';
    return num > 0 ? 'delta-positive' : num < 0 ? 'delta-negative' : 'delta-neutral';
  }

  /**
   * Classe CSS para pill de região.
   */
  getRegionPillClass(value: string): string {
    const v   = (value ?? '').trim().toUpperCase();
    const map: Record<string, string> = {
      RJ: 'rpill-rj',
      SP: 'rpill-sp',
      MG: 'rpill-mg',
      RS: 'rpill-rs',
      PR: 'rpill-pr',
      BA: 'rpill-ba',
    };
    return map[v] ?? 'rpill-default';
  }

  // ─── GRUPOS DE COLUNAS ───────────────────────────────────────────────────

  /**
   * Cria a lista de células do thead de grupos (linha acima dos cabeçalhos).
   * Colunas sem grupo geram uma célula transparente à esquerda.
   */
  get columnGroups(): { label: string; color: string; span: number; empty?: boolean }[] {
    if (!this.table?.hasGroups) return [];

    const result: { label: string; color: string; span: number; empty?: boolean }[] = [];
    let nonGrouped = 0;

    // Conta colunas sem grupo no início
    for (const col of this.table.columns) {
      if (!col.group) nonGrouped++;
      else break;
    }
    if (nonGrouped > 0) {
      result.push({ label: '', color: '', span: nonGrouped, empty: true });
    }

    // Agrupa as colunas restantes
    const grupos: Record<string, { color: string; span: number }> = {};
    for (const col of this.table.columns) {
      if (col.group) {
        if (!grupos[col.group]) {
          grupos[col.group] = { color: col.group_color ?? '#888', span: 0 };
        }
        grupos[col.group].span++;
      }
    }

    return [
      ...result,
      ...Object.entries(grupos).map(([label, g]) => ({
        label, color: g.color, span: g.span
      }))
    ];
  }

  // ─── ORDENAÇÃO ───────────────────────────────────────────────────────────

  /** Ordena as linhas pela coluna clicada. Segundo clique inverte a direção. */
  sortBy(col: ParsedColumn): void {
    if (col.type === 'text' || col.type === 'region' || col.type === 'status') return;

    if (this.sortKey === col.key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = col.key;
      this.sortAsc = false;
    }

    this.sortedRows = [...this.table.rows].sort((a, b) => {
      const va = parseFloat(String(a[col.key] ?? '0').replace(/[.,]/g, ''));
      const vb = parseFloat(String(b[col.key] ?? '0').replace(/[.,]/g, ''));
      return this.sortAsc ? va - vb : vb - va;
    });
  }

  // ─── EXPORTAÇÃO CSV ──────────────────────────────────────────────────────

  /** Gera e faz download de um arquivo CSV com os dados da tabela. */
  exportCsv(): void {
    if (!this.table?.columns?.length) return;

    const headers = this.table.columns.map(c => `"${c.label}"`).join(',');
    const rows    = this.table.rows.map(r =>
      this.table.columns.map(c => `"${r[c.key] ?? ''}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + headers + '\n' + rows], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href     = url;
    a.download = `relatorio-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Chave da primeira coluna (usada nas linhas especiais delta/total). */
  get firstColKey(): string {
    return this.table?.columns?.[0]?.key ?? '';
  }
}
