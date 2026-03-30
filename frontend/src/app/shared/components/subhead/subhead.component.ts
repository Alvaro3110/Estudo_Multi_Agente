import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subhead',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="subhead">
      <div class="left">
        <div class="dept-icon">
          <span>$</span>
        </div>
        <div class="titles">
          <h2>{{ title }}</h2>
          <p>{{ subtitle }}</p>
        </div>
      </div>
      <button class="btn-back">
        <span class="arrow"><</span> Voltar
      </button>
    </div>
  `,
  styles: [`
    .subhead {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .dept-icon {
      width: 40px;
      height: 40px;
      background: #FFF0F0;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #EC0000;
      font-weight: 700;
      font-size: 20px;
    }

    .titles {
      h2 {
        font-size: 18px;
        font-weight: 700;
        color: #333;
        margin-bottom: 2px;
      }
      p {
        font-size: 12px;
        color: #999;
      }
    }

    .btn-back {
      padding: 8px 16px;
      border: 0.5px solid #E0E0E0;
      color: #333;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      background: white;

      .arrow { margin-right: 4px; color: #EC0000; }
      &:hover { background: #f9f9f9; }
    }
  `]
})
export class SubheadComponent {
  @Input() title: string = 'Departamento Financeiro';
  @Input() subtitle: string = '4 agentes analisados · atualizado agora';
}
