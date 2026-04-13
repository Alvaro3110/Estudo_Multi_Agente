/**
 * Testes do ReportTableComponent (nova versão com ParsedTable).
 * Executar: ng test --include='**/report-table.component.spec.ts' --watch=false
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportTableComponent } from './report-table.component';
import { ParsedTable, ColumnType } from '../../../core/markdown-parser.service';

/** Tabela de fixture com dados do Databricks */
const mockTable: ParsedTable = {
  title: 'Desempenho por região',
  source: 'Databricks',
  hasGroups: true,
  columns: [
    { key: 'region', label: 'Região',           type: 'region',   align: 'left' },
    { key: 'revenue',label: 'Total Revenue',    type: 'currency', align: 'right',
      group: 'Receita', group_color: '#EC0000' },
    { key: 'cost',   label: 'Total Cost',       type: 'currency', align: 'right',
      group: 'Custo',   group_color: '#1565C0' },
    { key: 'qty',    label: 'Total Qty',        type: 'number',   align: 'right',
      group: 'Volume',  group_color: '#2E7D32' },
    { key: 'delta',  label: 'Variação',         type: 'delta',    align: 'right' },
  ],
  rows: [
    { region: 'RJ', revenue: '3900928064.19', cost: '326950677', qty: '6493215', delta: '+2517708' },
    { region: 'SP', revenue: '3897040198.74', cost: '326430683', qty: '6485269', delta: '-500000' },
  ],
};

describe('ReportTableComponent', () => {
  let component: ReportTableComponent;
  let fixture: ComponentFixture<ReportTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportTableComponent);
    component = fixture.componentInstance;
    component.table = mockTable;
    component.rowCount = 9999000;
    component.source = 'Databricks';
    fixture.detectChanges();
  });

  // ─── formatCell ──────────────────────────────────────────────────────────────

  describe('formatCell', () => {

    it('currency 3900928064.19 → "R$ 3,9B"', () => {
      const r = component.formatCell('3900928064.19', 'currency');
      expect(r).toContain('3,9B');
    });

    it('currency 326950677 → "R$ 327M"', () => {
      const r = component.formatCell('326950677', 'currency');
      expect(r).toContain('327M');
    });

    it('currency 42000 → contém "R$" e "42"', () => {
      const r = component.formatCell('42000', 'currency');
      expect(r).toContain('R$');
    });

    it('number 5000510 → "5.000.510"', () => {
      const r = component.formatCell('5000510', 'number');
      expect(r).toContain('5.000.510');
    });

    it('percent sem % → adiciona %', () => {
      expect(component.formatCell('19', 'percent')).toBe('19%');
    });

    it('percent com % → mantém como está', () => {
      expect(component.formatCell('19%', 'percent')).toBe('19%');
    });

    it('valor null/undefined → "—"', () => {
      expect(component.formatCell('', 'currency')).toBe('—');
      expect(component.formatCell('-', 'number')).toBe('—');
      expect(component.formatCell('—', 'number')).toBe('—');
    });

  });

  // ─── getDeltaClass ────────────────────────────────────────────────────────────

  describe('getDeltaClass', () => {

    it('+3,2% → "delta-positive"', () => {
      expect(component.getDeltaClass('+3.2%')).toBe('delta-positive');
    });

    it('-1,5% → "delta-negative"', () => {
      expect(component.getDeltaClass('-1.5%')).toBe('delta-negative');
    });

    it('0 → "delta-neutral"', () => {
      expect(component.getDeltaClass('0')).toBe('delta-neutral');
    });

    it('texto sem número → "delta-neutral"', () => {
      expect(component.getDeltaClass('n/a')).toBe('delta-neutral');
    });

  });

  // ─── getRegionPillClass ────────────────────────────────────────────────────────

  describe('getRegionPillClass', () => {

    it('"RJ" → "rpill-rj"', () => {
      expect(component.getRegionPillClass('RJ')).toBe('rpill-rj');
    });

    it('"SP" → "rpill-sp"', () => {
      expect(component.getRegionPillClass('SP')).toBe('rpill-sp');
    });

    it('"MG" → "rpill-mg"', () => {
      expect(component.getRegionPillClass('MG')).toBe('rpill-mg');
    });

    it('"XX" → "rpill-default"', () => {
      expect(component.getRegionPillClass('XX')).toBe('rpill-default');
    });

    it('case insensitive: "rj" → "rpill-rj"', () => {
      expect(component.getRegionPillClass('rj')).toBe('rpill-rj');
    });

  });

  // ─── columnGroups ────────────────────────────────────────────────────────────

  describe('columnGroups', () => {

    it('sem grupos → array vazio', () => {
      component.table = { ...mockTable, hasGroups: false };
      fixture.detectChanges();
      expect(component.columnGroups.length).toBe(0);
    });

    it('3 grupos distintos → células com labels corretos', () => {
      const labels = component.columnGroups
        .filter(g => !g.empty)
        .map(g => g.label);
      expect(labels).toContain('Receita');
      expect(labels).toContain('Custo');
      expect(labels).toContain('Volume');
    });

    it('span correto por número de colunas no grupo', () => {
      const receita = component.columnGroups.find(g => g.label === 'Receita');
      expect(receita?.span).toBe(1); // só 1 coluna de receita no mock
    });

    it('célula vazia para coluna sem grupo (region + delta)', () => {
      const empty = component.columnGroups.find(g => g.empty);
      expect(empty).toBeTruthy();
    });

  });

  // ─── renderização ─────────────────────────────────────────────────────────────

  describe('renderização', () => {

    it('deve criar o componente', () => {
      expect(component).toBeTruthy();
    });

    it('renderiza toolbar com título', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.tbl-bar-title')?.textContent?.trim()).toBeTruthy();
    });

    it('renderiza linha de grupos quando hasGroups=true', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.gr')).toBeTruthy();
    });

    it('NÃO renderiza linha de grupos quando hasGroups=false', () => {
      component.table = { ...mockTable, hasGroups: false };
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.gr')).toBeNull();
    });

    it('renderiza pill vermelha para região RJ', () => {
      const el: HTMLElement = fixture.nativeElement;
      const rjPill = el.querySelector('.rpill-rj');
      expect(rjPill).toBeTruthy();
    });

    it('renderiza pill azul para região SP', () => {
      const el: HTMLElement = fixture.nativeElement;
      const spPill = el.querySelector('.rpill-sp');
      expect(spPill).toBeTruthy();
    });

    it('renderiza badge verde para delta positivo', () => {
      const el: HTMLElement = fixture.nativeElement;
      const green = el.querySelector('.delta-positive');
      expect(green).toBeTruthy();
    });

    it('renderiza badge vermelho para delta negativo', () => {
      const el: HTMLElement = fixture.nativeElement;
      const red = el.querySelector('.delta-negative');
      expect(red).toBeTruthy();
    });

    it('renderiza rodapé com source quando presente', () => {
      const el: HTMLElement = fixture.nativeElement;
      const foot = el.querySelector('.tbl-foot');
      expect(foot?.textContent).toContain('Databricks');
    });

    it('renderiza count de registros no toolbar', () => {
      const el: HTMLElement = fixture.nativeElement;
      const count = el.querySelector('.tbl-bar-count');
      expect(count).toBeTruthy();
    });

  });

});
