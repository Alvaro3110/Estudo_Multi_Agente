import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RevenueItem {
  label: string;
  value: string;
  percent: number;
  trend: string;
  color: string;
}

@Component({
  selector: 'app-product-revenue-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      <h4 class="chart-title">RECEITA BRUTA POR PRODUTO (R$ MIL)</h4>
      <div class="bars">
        <div class="bar-row" *ngFor="let item of data">
          <span class="label">{{ item.label }}</span>
          <div class="track">
            <div class="fill" 
                 [style.width.%]="item.percent" 
                 [style.background-color]="item.color">
              <span class="value">{{ item.value }}</span>
            </div>
          </div>
          <span class="trend" [class.up]="item.trend.startsWith('+')">
            {{ item.trend }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chart-container {
      margin: 20px 0;
    }
    .chart-title {
      font-size: 11px;
      font-weight: 700;
      color: #999;
      margin-bottom: 16px;
    }
    .bars {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .bar-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .label {
      width: 120px;
      font-size: 12px;
      color: #555;
      font-weight: 500;
    }
    .track {
      flex: 1;
      height: 24px;
      background: #F5F5F5;
      border-radius: 4px;
      overflow: hidden;
    }
    .fill {
      height: 100%;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding-left: 10px;
      transition: width 1s ease-out;
      position: relative;
    }
    .value {
      font-size: 11px;
      font-weight: 700;
      color: white;
    }
    .trend {
      width: 40px;
      font-size: 12px;
      font-weight: 700;
      color: #999;
      text-align: right;
      &.up { color: #2E7D32; }
    }
  `]
})
export class ProductRevenueChartComponent {
  @Input() data: RevenueItem[] = [
    { label: 'Crédito Consignado', value: 'R$ 1.820K', percent: 85, trend: '+6%', color: '#EC0000' },
    { label: 'Conta Corrente PJ', value: 'R$ 980K', percent: 55, trend: '+3%', color: '#0070E0' },
    { label: 'Crédito Imobiliário', value: 'R$ 840K', percent: 45, trend: '+18%', color: '#43A047' },
    { label: 'Cartão Empresarial', value: 'R$ 550K', percent: 35, trend: '-4%', color: '#FB8C00' },
    { label: 'Câmbio & Trade Fina...', value: 'R$ 320K', percent: 20, trend: '0%', color: '#7E308E' }
  ];
}
