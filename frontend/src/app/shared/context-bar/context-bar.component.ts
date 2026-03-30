import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-context-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="context-bar">
      <span class="label">CONTEXTO DA CARTEIRA:</span>
      <span class="value">VAREJO DIGITAL SP / CORPORATE CENTER</span>
    </div>
  `,
  styles: [`
    .context-bar {
      padding: 8px 32px;
      background: white;
      border-bottom: 0.5px solid #F0F0F0;
      display: flex;
      align-items: center;
    }
    .label {
      font-size: 10px;
      color: #999;
      font-weight: 500;
      letter-spacing: 0.06em;
      margin-right: 8px;
    }
    .value {
      font-size: 11px;
      color: #EC0000;
      font-weight: 500;
    }
  `]
})
export class ContextBarComponent {}
