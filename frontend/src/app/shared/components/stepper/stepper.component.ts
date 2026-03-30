import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper-container">
      <div class="step first" [class.current]="currentStep === 1" [class.done]="currentStep > 1">
        <span class="num">1.</span> Seleção de Unidade
      </div>
      <div class="step second" [class.current]="currentStep === 2" [class.done]="currentStep > 2">
        <span class="num">2.</span> Relatório de Agentes
      </div>
      <div class="step last" [class.current]="currentStep === 3">
        <span class="num">3.</span> Ação
      </div>
    </div>
  `,
  styles: [`
    .stepper-container {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 24px 0;
    }

    .step {
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      color: #777;
      background: #E0E0E0;
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 200px;
      justify-content: center;
      z-index: 1;

      .num { font-weight: 400; }

      &.first { border-radius: 8px 0 0 8px; }
      &.last { border-radius: 0 8px 8px 0; }

      /* Estado: Concluído (Vermelho Escuro) */
      &.done {
        background: #B30000;
        color: white;
      }

      /* Estado: Atual (Vermelho Santander) */
      &.current {
        background: #EC0000;
        color: white;
        z-index: 2;
      }

      &:not(.last)::after {
        content: '';
        position: absolute;
        right: -10px;
        top: 0;
        width: 20px;
        height: 100%;
        background: inherit;
        clip-path: polygon(0 0, 100% 50%, 0 100%);
        z-index: 3;
      }
    }
  `]
})
export class StepperComponent {
  @Input() currentStep: number = 2;
}
