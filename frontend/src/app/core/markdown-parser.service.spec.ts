/**
 * Testes unitários do MarkdownParserService.
 * Executar: ng test --include='**/markdown-parser.service.spec.ts' --watch=false
 */
import { TestBed } from '@angular/core/testing';
import {
  MarkdownParserService, ContentBlock, ParsedTable, ActionItem
} from './markdown-parser.service';

describe('MarkdownParserService', () => {
  let service: MarkdownParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkdownParserService);
  });

  // ─── parseContent ───────────────────────────────────────────────────────────

  describe('parseContent', () => {

    it('texto puro → 1 bloco markdown', () => {
      const blocks = service.parseContent('Texto simples sem tabelas');
      expect(blocks.length).toBe(1);
      expect(blocks[0].type).toBe('markdown');
    });

    it('retorna [] para conteúdo vazio', () => {
      expect(service.parseContent('')).toEqual([]);
      expect(service.parseContent('   ')).toEqual([]);
    });

    it('tabela markdown pura → 1 bloco table', () => {
      const md = `| Região | Vendas |\n|---|---|\n| RJ | 1000 |\n| SP | 900 |`;
      const blocks = service.parseContent(md);
      expect(blocks.some(b => b.type === 'table')).toBeTrue();
    });

    it('texto + tabela + texto → 3 blocos na ordem correta', () => {
      const md = `Introdução\n| A | B |\n|---|---|\n| 1 | 2 |\nConclusão`;
      const blocks = service.parseContent(md);
      expect(blocks.length).toBe(3);
      expect(blocks[0].type).toBe('markdown');
      expect(blocks[1].type).toBe('table');
      expect(blocks[2].type).toBe('markdown');
    });

    it('tabela sem separador de cabeçalho → não detectada como tabela separada', () => {
      // Linha com | mas apenas 1 linha (sem a linha de dados)
      const md = `| Apenas título |`;
      const blocks = service.parseContent(md);
      // Deve ser um bloco markdown ou table com 0 rows
      if (blocks.some(b => b.type === 'table')) {
        const tbl = blocks.find(b => b.type === 'table')!;
        expect(tbl.table?.rows.length).toBe(0);
      } else {
        expect(blocks.every(b => b.type === 'markdown')).toBeTrue();
      }
    });

  });

  // ─── parseMarkdownTable ──────────────────────────────────────────────────────

  describe('parseMarkdownTable', () => {

    const mdLines = [
      '| Região | Vendas Totais | Total Transações |',
      '| RJ | 3900928064 | 5000510 |',
      '| SP | 3897040198 | 4999490 |',
    ];

    it('retorna null para menos de 2 linhas', () => {
      expect(service.parseMarkdownTable(['| A |'])).toBeNull();
    });

    it('detecta tipo region para coluna "Região"', () => {
      const tbl = service.parseMarkdownTable(mdLines)!;
      const col = tbl.columns.find(c => c.label.toLowerCase().includes('egião'));
      expect(col?.type).toBe('region');
    });

    it('detecta tipo currency para coluna "Vendas Totais"', () => {
      const tbl = service.parseMarkdownTable(mdLines)!;
      const col = tbl.columns.find(c => c.label.toLowerCase().includes('venda'));
      expect(col?.type).toBe('currency');
    });

    it('detecta tipo number para coluna "Total Transações"', () => {
      const lines = [
        '| Região | Total Transações |',
        '| RJ | 5000510 |',
      ];
      const tbl = service.parseMarkdownTable(lines)!;
      const col = tbl.columns.find(c => c.label.toLowerCase().includes('transac'));
      expect(col?.type).toBe('number');
    });

    it('detecta grupo Receita para coluna com "venda"', () => {
      const tbl = service.parseMarkdownTable(mdLines)!;
      const col = tbl.columns.find(c => c.label.toLowerCase().includes('venda'));
      expect(col?.group).toBe('Receita');
      expect(col?.group_color).toBe('#EC0000');
    });

    it('alinha colunas numéricas à direita', () => {
      const tbl = service.parseMarkdownTable(mdLines)!;
      tbl.columns.filter(c => c.type === 'currency' || c.type === 'number')
        .forEach(c => expect(c.align).toBe('right'));
    });

    it('alinha colunas de texto/region à esquerda', () => {
      const tbl = service.parseMarkdownTable(mdLines)!;
      const regionCol = tbl.columns.find(c => c.type === 'region');
      expect(regionCol?.align).toBe('left');
    });

    it('hasGroups = true quando há pelo menos 1 coluna com grupo', () => {
      const tbl = service.parseMarkdownTable(mdLines)!;
      expect(tbl.hasGroups).toBeTrue();
    });

  });

  // ─── buildTableFromDados ──────────────────────────────────────────────────────

  describe('buildTableFromDados (dados reais do Databricks)', () => {

    const dadosReais: Record<string, unknown>[] = [
      { region: 'RJ', total_revenue: 3900928064.19, total_transactions: 5000510, total_clients: 100000 },
      { region: 'SP', total_revenue: 3897040198.74, total_transactions: 4999490, total_clients: 100000 },
    ];

    it('retorna tabela vazia para array vazio', () => {
      const tbl = service.buildTableFromDados([]);
      expect(tbl.columns.length).toBe(0);
      expect(tbl.rows.length).toBe(0);
    });

    it('coluna region → type region, align left', () => {
      const tbl = service.buildTableFromDados(dadosReais);
      const col = tbl.columns.find(c => c.key === 'region')!;
      expect(col.type).toBe('region');
      expect(col.align).toBe('left');
    });

    it('coluna total_revenue → type currency, align right, group Receita', () => {
      const tbl = service.buildTableFromDados(dadosReais);
      const col = tbl.columns.find(c => c.key === 'total_revenue')!;
      expect(col.type).toBe('currency');
      expect(col.align).toBe('right');
      expect(col.group).toBe('Receita');
    });

    it('coluna total_transactions → type number, align right, group Volume', () => {
      const tbl = service.buildTableFromDados(dadosReais);
      const col = tbl.columns.find(c => c.key === 'total_transactions')!;
      expect(col.type).toBe('number');
      expect(col.group).toBe('Volume');
    });

    it('limita a 8 colunas mesmo com mais campos', () => {
      const muitas: Record<string, unknown>[] = [
        Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`col${i}`, i]))
      ];
      const tbl = service.buildTableFromDados(muitas);
      expect(tbl.columns.length).toBeLessThanOrEqual(8);
    });

    it('label legível: total_revenue → "Total Revenue"', () => {
      const tbl = service.buildTableFromDados(dadosReais);
      const col = tbl.columns.find(c => c.key === 'total_revenue')!;
      expect(col.label).toBe('Total Revenue');
    });

    it('source = "Databricks"', () => {
      const tbl = service.buildTableFromDados(dadosReais);
      expect(tbl.source).toBe('Databricks');
    });

    it('hasGroups = true quando há colunas com revenue/transactions', () => {
      const tbl = service.buildTableFromDados(dadosReais);
      expect(tbl.hasGroups).toBeTrue();
    });

    it('gera rows com todas as colunas mapeadas', () => {
      const tbl = service.buildTableFromDados(dadosReais);
      expect(tbl.rows.length).toBe(2);
      expect(tbl.rows[0]['region']).toBe('RJ');
    });

  });

  // ─── cleanRepeatedText ─────────────────────────────────────────────────────────

  describe('cleanRepeatedText', () => {

    it('não altera texto vazio', () => {
      expect(service.cleanRepeatedText('')).toBe('');
    });

    it('não altera texto com menos de 30 chars', () => {
      const t = 'Texto curto';
      expect(service.cleanRepeatedText(t)).toBe(t);
    });

    it('não altera texto normal sem repetição', () => {
      const t = 'RJ lidera com R$ 3,9 bi em receita, superando SP por margem estreita.';
      expect(service.cleanRepeatedText(t)).toBe(t);
    });

    it('remove padrão .x.x.x no final', () => {
      const t = 'Análise de vendas.vendas.vendas';
      const result = service.cleanRepeatedText(t);
      expect(result.endsWith('.vendas.vendas')).toBeFalse();
    });

    it('remove bloco repetido de 30 chars no sufixo', () => {
      const half = ' análise concluída com sucesso!!';   // 32 chars
      const t    = `Relatório gerado.${half}${half}`;
      const result = service.cleanRepeatedText(t);
      // Não deve terminar com a repetição dobrada
      expect(result.length).toBeLessThan(t.length);
    });

  });

  // ─── extractActions ────────────────────────────────────────────────────────────

  describe('extractActions', () => {

    it('retorna [] para conteúdo sem ações numeradas', () => {
      expect(service.extractActions('')).toEqual([]);
      expect(service.extractActions('Texto sem lista')).toEqual([]);
    });

    it('detecta ações no padrão "1. **Título**: descrição"', () => {
      const md = `1. **Reduzir custos**: Renegociar contratos logísticos em RJ.\n2. **Expandir SP**: Adicionar pontos de venda premium.`;
      const actions = service.extractActions(md);
      expect(actions.length).toBe(2);
      expect(actions[0].title).toContain('Reduzir');
      expect(actions[0].description).toBeTruthy();
    });

    it('extrai título e descrição separadamente', () => {
      const md = `1. **Negociação**: Revisar contratos com fornecedores.`;
      const [a] = service.extractActions(md);
      expect(a.title).toBe('Negociação');
      expect(a.description).toContain('Revisar');
    });

    it('funciona com 3 ações numeradas', () => {
      const md = [
        '1. **Ação A**: Descrição A.',
        '2. **Ação B**: Descrição B.',
        '3. **Ação C**: Descrição C.',
      ].join('\n');
      expect(service.extractActions(md).length).toBe(3);
    });

  });

});
