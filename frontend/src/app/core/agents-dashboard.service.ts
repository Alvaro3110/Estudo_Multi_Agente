import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

/**
 * Interface para os Agentes de IA.
 */
export interface AgentState {
  id: string;
  name: string;
  description: string;
  status: 'running' | 'waiting' | 'idle' | 'error';
  iconType: 'credit' | 'fraud' | 'support' | 'invest';
}

/**
 * Interface para Eventos de Atividade.
 */
export interface ActivityEvent {
  type: 'amber' | 'verde' | 'azul' | 'red';
  message: string;
  time: string;
}

@Injectable({
  providedIn: 'root'
})
export class AgentsDashboardService {
  
  // Dados Mock iniciais conforme especificação
  private initialAgents: AgentState[] = [
    { id: 'a1', name: 'Agente de Crédito', description: 'Analisando proposta #48821 — scoring em andamento', status: 'running', iconType: 'credit' },
    { id: 'a2', name: 'Agente Antifraude', description: 'Aguarda aprovação — transação R$ 42.000', status: 'waiting', iconType: 'fraud' },
    { id: 'a3', name: 'Agente de Atendimento', description: 'Resolvendo ticket #3391 — conta corrente', status: 'running', iconType: 'support' },
    { id: 'a4', name: 'Agente de Investimentos', description: 'Idle — último: rebalanceamento às 09:14', status: 'idle', iconType: 'invest' }
  ];

  private initialActivities: ActivityEvent[] = [
    { type: 'amber', message: 'Agente Antifraude pausou — checkpoint HITL acionado (TED R$ 42k)', time: 'há 2 min' },
    { type: 'verde', message: 'Agente de Crédito aprovou proposta #48819 — score 742', time: 'há 7 min' },
    { type: 'azul', message: 'Agente de Atendimento resolveu 12 tickets na última hora', time: 'há 14 min' },
    { type: 'red', message: 'Agente de Crédito — timeout na consulta ao Serasa (retry automático)', time: 'há 31 min' }
  ];

  private agentsSubject = new BehaviorSubject<AgentState[]>(this.initialAgents);
  private activitiesSubject = new BehaviorSubject<ActivityEvent[]>(this.initialActivities);

  constructor() {}

  /**
   * Retorna os agentes como Observable.
   */
  getAgents(): Observable<AgentState[]> {
    return this.agentsSubject.asObservable();
  }

  /**
   * Retorna o feed de atividades como Observable.
   */
  getActivity(): Observable<ActivityEvent[]> {
    return this.activitiesSubject.asObservable();
  }

  /**
   * Aprova uma ação requerida (HITL).
   */
  approveHitl(agentId: string): void {
    const current = this.agentsSubject.getValue();
    const updated = current.map(agent => 
      agent.id === agentId ? { ...agent, status: 'running' as const } : agent
    );
    this.agentsSubject.next(updated);
    this.addLog('verde', `Aprovação manual concedida para ${agentId}.`);
  }

  /**
   * Rejeita uma ação requerida (HITL).
   */
  rejectHitl(agentId: string): void {
    const current = this.agentsSubject.getValue();
    const updated = current.map(agent => 
      agent.id === agentId ? { ...agent, status: 'idle' as const } : agent
    );
    this.agentsSubject.next(updated);
    this.addLog('red', `Ação do agente ${agentId} foi rejeitada manualmente.`);
  }

  private addLog(type: ActivityEvent['type'], message: string) {
    const newLog: ActivityEvent = { type, message, time: 'agora mesmo' };
    this.activitiesSubject.next([newLog, ...this.activitiesSubject.getValue()]);
  }
}
