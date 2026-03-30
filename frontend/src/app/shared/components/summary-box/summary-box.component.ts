import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-box',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="summary-box" [ngClass]="'step-' + step">
      <div class="content">
        <div class="icon-circle">
          <span class="icon">✨</span>
        </div>
        <div class="text">
          <p class="main-text" [innerHTML]="message || defaultMessages[step]"></p>
          <p class="sub-text">Atualizado há 1 minuto</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-box {
      margin: 24px 0;
      padding: 16px 20px;
      background: #FEEEEE;
      border: 0.5px solid #EC0000;
      border-radius: 12px;
      
      &.step-2 {
        background: #F5F5F5;
        border-color: #E0E0E0;
        .icon-circle { background: #EEE; }
        .main-text { color: #333; }
      }
    }

    .content {
      display: flex;
      align-items: center;
      gap: 16px;
      align-items: center;
      flex: 1;
    }

    .step2-info {
        font-size: 13px;
        color: #999;
    }

    .info-icon {
      width: 32px;
      height: 32px;
      border: 1px solid #EC0000;
      border-radius: 50%;
      color: #EC0000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      flex-shrink: 0;
    }

    .title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
      color: #333;
    }

    .desc {
      font-size: 13px;
      line-height: 1.5;
      color: #666;
    }

    .btn-action {
      background: white;
      border: 1px solid #333;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      color: #333;
      white-space: nowrap;

      &:hover { background: #f0f0f0; }
    }
  `]
})
export class SummaryBoxComponent {
  @Input() step: number = 1;
  @Input() message: string = '';

  defaultMessages: Record<number, string> = {
    1: 'Selecione um Agente IA para iniciar o monitoramento detalhado.',
    2: 'Análise concluída com sucesso. O Agente identificou oportunidades de otimização.',
    3: 'Pronto para execução. Revise as ações propostas pelo agente.'
  };
}
