import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CustomerRow {
  name: string;
  product: string;
  volume: string;
  var: string;
  status: 'ativo' | 'atenção' | 'risco';
}

@Component({
  selector: 'app-customer-status-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="table-container">
      <h4 class="table-title">PRINCIPAIS CLIENTES POR PRODUTO</h4>
      <table class="san-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Volume (out)</th>
            <th>Var. mês</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let row of rows">
            <td class="bold">{{ row.name }}</td>
            <td>{{ row.product }}</td>
            <td>{{ row.volume }}</td>
            <td [class.up]="row.var.startsWith('+')" [class.down]="row.var.startsWith('-')">
              {{ row.var }}
            </td>
            <td>
              <span class="badge" [ngClass]="row.status">{{ row.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-container {
      margin-top: 24px;
    }
    .table-title {
      font-size: 11px;
      font-weight: 700;
      color: #999;
      margin-bottom: 12px;
    }
    .san-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      
      th {
        text-align: left;
        padding: 8px;
        color: #999;
        font-weight: 500;
        border-bottom: 0.5px solid #F0F0F0;
      }
      
      td {
        padding: 10px 8px;
        color: #555;
        border-bottom: 0.5px solid #F0F0F0;
        
        &.bold { font-weight: 700; color: #333; }
        &.up { color: #2E7D32; font-weight: 600; }
        &.down { color: #B30000; font-weight: 600; }
      }
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 700;
      
      &.ativo { background: #E8F5E9; color: #2E7D32; }
      &.atenção { background: #FFF3E0; color: #FB8C00; }
      &.risco { background: #FFEBEE; color: #B30000; }
    }
  `]
})
export class CustomerStatusTableComponent {
  @Input() rows: CustomerRow[] = [
    { name: 'XPTO Incorporações', product: 'Crédito Imobiliário', volume: 'R$ 285K', var: '+34%', status: 'ativo' },
    { name: 'Grupo Alfa Logística', product: 'Crédito Consignado', volume: 'R$ 210K', var: '+8%', status: 'ativo' },
    { name: 'Beta Varejo S.A.', product: 'Cartão Empresarial', volume: 'R$ 142K', var: '-12%', status: 'atenção' },
    { name: 'Omega Tech LTDA', product: 'Conta Corrente PJ', volume: 'R$ 98K', var: '+2%', status: 'ativo' },
    { name: 'Delta Exportações', product: 'Câmbio & Trade Finance', volume: 'R$ 76K', var: '-21%', status: 'risco' }
  ];
}
