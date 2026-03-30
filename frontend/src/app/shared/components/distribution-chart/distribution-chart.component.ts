import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-distribution-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dist-card">
      <h3>Distribuição por tipo</h3>
      
      <div class="bars-container">
        <div class="bar-row" *ngFor="let item of data">
          <div class="bar-header">
            <span class="label">{{ item.label }}</span>
            <span class="percent">{{ item.value }}%</span>
          </div>
          <div class="track">
            <div class="fill" 
                 [style.width.%]="isLoaded ? item.value : 0" 
                 [style.background-color]="item.color">
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./distribution-chart.component.scss']
})
export class DistributionChartComponent implements OnInit {
  isLoaded = false;
  
  data = [
    { label: 'Crédito', value: 41, color: '#EC0000' },
    { label: 'Antifraude', value: 28, color: '#F57F17' },
    { label: 'Atendimento', value: 22, color: '#1E88E5' },
    { label: 'Investimentos', value: 9, color: '#43A047' }
  ];

  ngOnInit() {
    // Pequeno delay para disparar a animação de width (0 -> target)
    setTimeout(() => this.isLoaded = true, 100);
  }
}
