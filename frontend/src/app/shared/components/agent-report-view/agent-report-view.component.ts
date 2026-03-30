import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductRevenueChartComponent } from '../product-revenue-chart/product-revenue-chart.component';
import { CustomerStatusTableComponent } from '../customer-status-table/customer-status-table.component';
import { AgentReportData } from '../../../core/report-data.mock';

@Component({
  selector: 'app-agent-report-view',
  standalone: true,
  imports: [CommonModule, ProductRevenueChartComponent, CustomerStatusTableComponent],
  template: `
    <div class="report-wrapper" *ngIf="data">
      <div class="agent-header">
        <div class="agent-icon-circle">
          <span class="icon">🔴</span>
        </div>
        <div class="header-text">
          <span class="agent-name">{{ data.agentName }}</span>
          <span class="timestamp">{{ data.timestamp }}</span>
        </div>
      </div>

      <div class="report-card">
        <div class="card-top-bar">
          <h3>{{ data.reportTitle }}</h3>
          <span class="status-badge">concluído</span>
        </div>

        <div class="description">
          <p [innerHTML]="data.description"></p>
        </div>

        <app-product-revenue-chart [data]="data.revenueData"></app-product-revenue-chart>

        <app-customer-status-table [rows]="data.customerData"></app-customer-status-table>

        <div class="footer-insight">
           <div class="insight-icon">🔴</div>
           <p [innerHTML]="data.footerInsight"></p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./agent-report-view.component.scss']
})
export class AgentReportViewComponent {
  @Input() data: AgentReportData | null = null;
}
