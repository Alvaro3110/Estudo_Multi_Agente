import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Define the interface directly here, mimicking backend's PipelineState
export interface PipelineState {
  steps_done: string[];
  step_active: string | null;
  steps_pending: string[];
  current_label: string;
  is_replanning: boolean;
  replan_count: number;
  total_steps: number;
}

export interface DisplayStep {
  node: string;
  isDone: boolean;
  isActive: boolean;
}

@Component({
  selector: 'app-pipeline-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pipeline-tracker.component.html',
  styleUrls: ['./pipeline-tracker.component.scss']
})
export class PipelineTrackerComponent {
  @Input() state!: PipelineState;

  // Nós visíveis para o tracker (excluindo internos)
  VISIBLE_NODES = [
    'transformer', 'planner', 'data_scanner', 'categorical_semantic',
    'router', 'agentes', 'consolidador'
  ];

  // Agrupa agentes em um único passo "agentes" para simplificar
  getDisplaySteps(): DisplayStep[] {
    if (!this.state) return [];
    
    return this.VISIBLE_NODES.map(node => {
      const isDone = this.state.steps_done.includes(node) ||
        (node === 'agentes' && this.state.steps_done.some(s => s.startsWith('agente_')));
        
      const isActive = this.state.step_active === node ||
        (node === 'agentes' && !!this.state.step_active?.startsWith('agente_'));
        
      return { node, isDone, isActive };
    });
  }
}
