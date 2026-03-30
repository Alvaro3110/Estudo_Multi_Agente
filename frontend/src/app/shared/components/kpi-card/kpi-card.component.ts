import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card" [class.accent]="accent">
      <span class="label">{{ label }}</span>
      <div class="main-val">
        <span class="value">{{ value }}</span>
      </div>
      <div class="footer">
        <span class="trend" [ngClass]="trend">
          {{ trend === 'up' ? '↑' : trend === 'down' ? '↓' : '·' }} {{ sub }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      background: white;
      border: 0.5px solid #E0E0E0;
      border-top: 2px solid transparent;
      border-radius: 10px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-height: 90px;

      &.accent {
        border-top: 2px solid #EC0000;
      }
    }

    .label {
      font-size: 11px;
      color: #999;
      font-weight: 500;
    }

    .value {
      font-size: 26px;
      font-weight: 700;
      color: #333;
    }

    .footer {
      margin-top: auto;
    }

    .trend {
      font-size: 11px;
      font-weight: 600;
      &.up { color: #2E7D32; }
      &.down { color: #B30000; }
      &.neutral { color: #999; }
    }
  `]
})
export class KpiCardComponent {
  @Input() label: string = '';
  @Input() value: string = '';
  @Input() sub: string = '';
  @Input() trend: 'up' | 'down' | 'neutral' = 'neutral';
  @Input() accent: boolean = false;
}
