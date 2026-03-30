import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AgentStep } from './agent.service';

export interface AgentState {
  id: string;
  name: string;
  status: 'idle' | 'thinking' | 'action' | 'waiting' | 'complete' | 'error';
  lastStep: AgentStep | null;
  history: AgentStep[];
  sessionId: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AgentsStateService {
  private agentsSubject = new BehaviorSubject<AgentState[]>([]);
  agents$ = this.agentsSubject.asObservable();

  constructor() {}

  /**
   * Registra um novo agente no sistema.
   */
  registerAgent(id: string, name: string): void {
    const current = this.agentsSubject.getValue();
    if (current.find(a => a.id === id)) return;

    const newAgent: AgentState = {
      id,
      name,
      status: 'idle',
      lastStep: null,
      history: [],
      sessionId: null
    };

    this.agentsSubject.next([...current, newAgent]);
  }

  /**
   * Atualiza o estado de um agente baseado em um novo step recebido.
   */
  updateAgent(id: string, step: AgentStep): void {
    const current = this.agentsSubject.getValue();
    const updated = current.map(agent => {
      if (agent.id === id) {
        const newStatus = this.mapStepToStatus(step.type);
        return {
          ...agent,
          status: newStatus,
          lastStep: step,
          history: [step, ...agent.history], // Histórico do mais recente para o antigo
          sessionId: step.session_id || agent.sessionId
        };
      }
      return agent;
    });
    this.agentsSubject.next(updated);
  }

  /**
   * Remove um agente do estado.
   */
  removeAgent(id: string): void {
    const current = this.agentsSubject.getValue();
    this.agentsSubject.next(current.filter(a => a.id !== id));
  }

  /**
   * Retorna os agentes como Observable.
   */
  getAgents(): Observable<AgentState[]> {
    return this.agents$;
  }

  private mapStepToStatus(type: AgentStep['type']): AgentState['status'] {
    switch (type) {
      case 'thinking': return 'thinking';
      case 'action': return 'action';
      case 'checkpoint': return 'waiting';
      case 'complete': return 'complete';
      default: return 'idle';
    }
  }
}
