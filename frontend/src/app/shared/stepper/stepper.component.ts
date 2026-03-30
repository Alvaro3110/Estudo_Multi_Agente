import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stepper-container">
      <div class="step" [class.active]="currentStep === 1" [class.done]="currentStep > 1">
        <span class="pill">1. Seleção de Unidade</span>
        <div class="arrow" *ngIf="currentStep !== 3"></div>
      </div>
      
      <div class="step" [class.active]="currentStep === 2" [class.done]="currentStep > 2" [class.future]="currentStep < 2">
        <span class="pill">2. Relatório de Agentes</span>
        <div class="arrow" *ngIf="currentStep !== 3"></div>
      </div>
      
      <div class="step last" [class.active]="currentStep === 3" [class.future]="currentStep < 3">
        <span class="pill">3. Ação</span>
      </div>
    </div>
  `,
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent {
  @Input() currentStep: 1 | 2 | 3 = 1;
}
