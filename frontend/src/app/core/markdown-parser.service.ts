import { Injectable } from '@angular/core';

/**
 * Serviço de parsing de conteúdo markdown para blocos tipados.
 * Detecta tabelas markdown e as separa do texto narrativo,
 * permitindo renderização especializada com tipos de coluna automáticos.
 */
@Injectable({ providedIn: 'root' })
export class MarkdownParserService {

  /**
   * Divide o conteúdo markdown em blocos tipados (markdown | table).
   * Percorre linha a linha e agrupa o que é tabela separadamente.
   */
  parseContent(content: string): ContentBlock[] {
    if (!content?.trim()) return [];

    const blocks: ContentBlock[] = [];
    const lines = content.split('\n');
    let buffer: string[] = [];
    let tableLines: string[] = [];
    let inTable = false;

    // Flush do buffer de texto acumulado
    const flushBuffer = () => {
      const text = buffer.join('\n').trim();
      if (text) blocks.push({ type: 'markdown', content: text });
      buffer = [];
    };

    // Flush de linhas de tabela acumuladas
    const flushTable = () => {
      if (tableLines.length >= 2) {
        const parsed = this.parseMarkdownTable(tableLines);
        if (parsed) blocks.push({ type: 'table', table: parsed });
      }
      tableLines = [];
    };

    for (const line of lines) {
      const trimmed = line.trim();
      const isTableLine = trimmed.startsWith('|') && trimmed.endsWith('|');
      const isSeparator  = /^\|[\s\-|:]+\|$/.test(trimmed);

      if (isTableLine || isSeparator) {
        if (!inTable) {
          flushBuffer();
          inTable = true;
        }
        // Pula linhas separadoras (---|---) mas mantém a estrutura
        if (!isSeparator) tableLines.push(line);
      } else {
        if (inTable) {
          flushTable();
          inTable = false;
        }
        buffer.push(line);
      }
    }

    // Flush final
    if (inTable) flushTable();
    flushBuffer();

    return blocks;
  }

  /**
   * Converte linhas de tabela markdown em ParsedTable tipada.
   * Detecta automaticamente tipo de coluna por nome e valor de amostra.
   * Retorna null se não for possível parsear.
   */
  parseMarkdownTable(lines: string[]): ParsedTable | null {
    if (lines.length < 2) return null;

    const parseRow = (line: string): string[] =>
      line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());

    const headers = parseRow(lines[0]);
    const rows    = lines.slice(1).map(parseRow);

    const columns: ParsedColumn[] = headers.map((h, i) => {
      const key    = `col_${i}`;
      const label  = h;
      const sample = rows[0]?.[i] ?? '';
      const hLower = h.toLowerCase();
      const sSample = sample.replace(/[R$.\s]/g, '').replace(',', '.');

      let type: ColumnType = 'text';
      let align: 'left' | 'right' = 'left';
      let group: string | undefined;
      let group_color: string | undefined;

      // Detectar tipo de coluna pelo nome e pelo valor de amostra
      if (/region|região|regiao|uf|estado/.test(hLower)) {
        type  = 'region';
        align = 'left';
      } else if (
        /venda|receita|revenue|custo|cost|valor|faturamento|total.*r/.test(hLower) ||
        sample.startsWith('R$') ||
        (!isNaN(Number(sSample)) && Number(sSample) > 10000)
      ) {
        type  = 'currency';
        align = 'right';
      } else if (/\d+[,.]?\d*%/.test(sample) || /pct|percent|taxa|margem/.test(hLower)) {
        type  = 'percent';
        align = 'right';
      } else if (/[+\-]\d/.test(sample) && /%|pp/.test(sample)) {
        type  = 'delta';
        align = 'right';
      } else if (!isNaN(Number(sSample)) && sSample.length > 0) {
        type  = 'number';
        align = 'right';
      }

      // Detectar grupo semântico pelo nome da coluna
      if (/venda|receita|revenue|faturamento/.test(hLower)) {
        group = 'Receita'; group_color = '#EC0000';
      } else if (/custo|cost|despesa/.test(hLower)) {
        group = 'Custo'; group_color = '#1565C0';
      } else if (/quantidade|qty|volume|estoque/.test(hLower)) {
        group = 'Volume'; group_color = '#2E7D32';
      } else if (/transac|transaction/.test(hLower)) {
        group = 'Volume'; group_color = '#2E7D32';
      } else if (/client|customer/.test(hLower)) {
        group = 'Clientes'; group_color = '#6A1B9A';
      }

      return { key, label, type, align, group, group_color };
    });

    const parsedRows = rows.map(cells =>
      Object.fromEntries(columns.map((col, i) => [col.key, cells[i] ?? '']))
    );

    return {
      columns,
      rows:      parsedRows,
      hasGroups: columns.some(c => !!c.group),
    };
  }

  /**
   * Constrói um ParsedTable a partir de um array de objetos do Databricks.
   * Prioridade sobre tabelas detectadas no markdown.
   */
  buildTableFromDados(dados: Record<string, unknown>[]): ParsedTable {
    if (!dados?.length) return { columns: [], rows: [], hasGroups: false };

    const keys = Object.keys(dados[0]).slice(0, 8); // máx 8 colunas

    const columns: ParsedColumn[] = keys.map(key => {
      const k      = key.toLowerCase();
      const sample = String(dados[0][key] ?? '');

      let type:        ColumnType       = 'text';
      let align:       'left' | 'right' = 'left';
      let group:       string | undefined;
      let group_color: string | undefined;

      if (/region|regiao|uf/.test(k)) {
        type = 'region'; align = 'left';
      } else if (/revenue|receita|venda|custo|cost|valor|total_r/.test(k) ||
                 (!isNaN(Number(sample)) && Number(sample) > 100000)) {
        type  = 'currency'; align = 'right';
        if (/revenue|receita|venda/.test(k))  { group = 'Receita'; group_color = '#EC0000'; }
        else if (/custo|cost/.test(k))         { group = 'Custo';   group_color = '#1565C0'; }
      } else if (/count|total|qty|quantity|transac|transaction/.test(k)) {
        type = 'number'; align = 'right'; group = 'Volume'; group_color = '#2E7D32';
      } else if (/pct|percent|taxa|margem/.test(k)) {
        type = 'percent'; align = 'right';
      }

      // Label legível: total_revenue → Total Revenue
      const label = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      return { key, label, type, align, group, group_color };
    });

    const rows = dados.map(d =>
      Object.fromEntries(keys.map(k => [k, String(d[k] ?? '')]))
    );

    return {
      columns,
      rows,
      hasGroups: columns.some(c => !!c.group),
      source:    'Databricks',
    };
  }

  /**
   * Extrai seções do markdown divididas por cabeçalho ##.
   * Retorna mapa: { 'resumo executivo': '...texto...' }
   */
  extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const parts = content.split(/^##\s+/m);
    for (const part of parts.slice(1)) {
      const [title, ...body] = part.split('\n');
      sections[title.toLowerCase().trim()] = body.join('\n').trim();
    }
    return sections;
  }

  /**
   * Extrai ações numeradas no padrão "1. **Título**: descrição"
   * ou "1. Título — descrição"
   */
  extractActions(content: string): ActionItem[] {
    if (!content) return [];

    const pattern = /^\d+\.\s+(?:\*\*(.+?)\*\*[:\s—–-]+(.+)|(.+?)[:\s—–-]+(.+))$/gm;
    const actions: ActionItem[] = [];
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content)) !== null) {
      const title       = (match[1] ?? match[3] ?? '').trim();
      const description = (match[2] ?? match[4] ?? '').trim();
      if (title) actions.push({ title, description });
    }

    return actions;
  }

  /**
   * Remove texto repetido no final — corrige o bug de concatenação do streaming.
   * Detecta padrões como ".s.s.s." ou "texto. texto." no sufixo.
   */
  cleanRepeatedText(content: string): string {
    if (!content || content.length < 30) return content;

    let cleaned = content;

    // Padrão 1: sufixos tipo ".vendas.vendas.vendas"
    cleaned = cleaned.replace(/(\.[a-zA-ZÀ-ú]+){2,}$/, '.');

    // Padrão 2: bloco de 30 chars repetido no final
    if (cleaned.length >= 60) {
      const tail = cleaned.slice(-60);
      const half = tail.slice(0, 30);
      if (tail.endsWith(half) && half.trim().length > 5) {
        cleaned = cleaned.slice(0, -30);
      }
    }

    return cleaned.trim();
  }
}

// ─── Interfaces exportadas ──────────────────────────────────────────────────

/** Tipos possíveis de coluna para renderização especializada. */
export type ColumnType = 'text' | 'number' | 'currency' | 'percent' | 'delta' | 'region' | 'status';

/** Definição de uma coluna com tipo e grupamento semântico. */
export interface ParsedColumn {
  key:         string;
  label:       string;
  type:        ColumnType;
  align:       'left' | 'right' | 'center';
  group?:      string;
  group_color?: string;
}

/** Tabela estruturada pronta para renderização no ReportTableComponent. */
export interface ParsedTable {
  columns:   ParsedColumn[];
  rows:      Record<string, any>[];
  hasGroups?: boolean;
  title?:    string;
  source?:   string;
}

/** Bloco de conteúdo gerado pelo parseContent(). */
export interface ContentBlock {
  type:     'markdown' | 'table';
  content?: string;
  table?:   ParsedTable;
}

/** Item de ação recomendada extraído do markdown. */
export interface ActionItem {
  title:       string;
  description: string;
}
