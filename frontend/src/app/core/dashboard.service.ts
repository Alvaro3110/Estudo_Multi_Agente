import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Department {
  id: string;
  name: string;
  iconType: 'financeiro' | 'rh' | 'logistica' | 'tech';
  agentCount: number;
  efficiency: number;
  status: 'ready' | 'processing';
}

export interface AgentReport {
  agentName: string;
  agentType: string;
  status: 'done' | 'running';
  timestamp: string;
  insights?: { color: 'red' | 'green' | 'amber' | 'blue' | 'gray', text: string }[];
  chartData: { label: string, value: number, pct: number, trend: number }[];
  tableData: { client: string, product: string, volume: string, var: number, status: 'ativo' | 'atencao' | 'risco' }[];
  conclusion: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  agentSource: string;
  iconType: 'phone' | 'alert' | 'chart' | 'monitor' | 'shield';
  decision?: 'approve' | 'delegate' | 'dismiss';
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private departments: Department[] = [
    { id: 'fin', name: 'Departamento Financeiro', iconType: 'financeiro', agentCount: 4, efficiency: 98, status: 'ready' },
    { id: 'rh', name: 'Recursos Humanos', iconType: 'rh', agentCount: 4, efficiency: 97, status: 'ready' },
    { id: 'log', name: 'Operações e Logística', iconType: 'logistica', agentCount: 4, efficiency: 95, status: 'ready' },
    { id: 'tec', name: 'Tecnologia & Inovação', iconType: 'tech', agentCount: 4, efficiency: 99, status: 'ready' }
  ];

  private agentReport: AgentReport = {
    agentName: 'Agente de Fluxo de Caixa',
    agentType: 'Análise de receita e despesas',
    status: 'done',
    timestamp: 'hoje 09:38',
    chartData: [
      { label: 'Crédito Consignado', value: 1820, pct: 90, trend: 6 },
      { label: 'Conta Corrente PJ', value: 980, pct: 48, trend: 3 },
      { label: 'Crédito Imobiliário', value: 840, pct: 41, trend: 18 },
      { label: 'Cartão Empresarial', value: 550, pct: 27, trend: -4 },
      { label: 'Câmbio & Trade Finance', value: 320, pct: 16, trend: 0 }
    ],
    tableData: [
      { client: 'XPTO Incorporações', product: 'Crédito Imobiliário', volume: 'R$ 285K', var: 34, status: 'ativo' },
      { client: 'Grupo Alfa Logística', product: 'Crédito Consignado', volume: 'R$ 210K', var: 8, status: 'ativo' },
      { client: 'Beta Varejo S.A.', product: 'Cartão Empresarial', volume: 'R$ 142K', var: -12, status: 'atencao' },
      { client: 'Omega Tech LTDA', product: 'Conta Corrente PJ', volume: 'R$ 98K', var: 2, status: 'ativo' },
      { client: 'Delta Exportações', product: 'Câmbio & Trade Finance', volume: 'R$ 76K', var: -21, status: 'risco' }
    ],
    conclusion: 'A tabela acima evidencia que o produto Crédito Imobiliário deve manter trajetória de crescimento no Q4, sustentado principalmente pelo comportamento do cliente XPTO Incorporações, cuja expansão de portfólio sinaliza novos contratos já em pipeline. Em contrapartida, Delta Exportações apresenta queda de 21% em Câmbio, recomendando-se contato proativo da equipe comercial antes do fechamento de novembro.'
  };

  private actionItems: ActionItem[] = [
    { id: 'a1', title: 'Contato proativo com Delta Exportações', description: 'Cliente apresentou queda de 21% em Câmbio & Trade Finance. Risco de churn elevado. Recomendar reunião comercial antes do fechamento de novembro.', priority: 'high', agentSource: 'Agente de Fluxo de Caixa', iconType: 'phone' },
    { id: 'a2', title: 'Revisão de cláusulas — 2 contratos próximos ao vencimento', description: 'Agente de Risco identificou 2 contratos com vencimento em menos de 30 dias sem renovação iniciada. Exposição combinada de R$ 1,2M.', priority: 'high', agentSource: 'Agente de Risco', iconType: 'alert' },
    { id: 'a3', title: 'Proposta de expansão para XPTO Incorporações', description: 'Cliente cresceu 34% em Crédito Imobiliário. Pipeline indica novos projetos em Q1. Oportunidade de oferta proativa de produto complementar (Conta Escrow).', priority: 'medium', agentSource: 'Agente de Fluxo de Caixa', iconType: 'chart' },
    { id: 'a4', title: 'Monitorar queda no Cartão Empresarial — Beta Varejo', description: 'Beta Varejo S.A. reduziu uso do cartão empresarial em 12%. Análise de crédito preventiva e contato da gerência de relacionamento recomendados.', priority: 'medium', agentSource: 'Agente de Previsão', iconType: 'monitor' },
    { id: 'a5', title: 'Manter reserva de caixa acima de 15%', description: 'Cenário pessimista contempla queda de 2,1% na receita no Q4. Recomenda-se preservar liquidez mínima como medida preventiva.', priority: 'low', agentSource: 'Agente de Previsão', iconType: 'shield' }
  ];

  private decisionsSubject = new BehaviorSubject<{ [id: string]: 'approve' | 'delegate' | 'dismiss' }>({});

  getDepartments(): Observable<Department[]> {
    return of(this.departments);
  }

  getAgentReport(deptId: string): Observable<AgentReport> {
    return of(this.agentReport);
  }

  getActionItems(deptId: string): Observable<ActionItem[]> {
    return of(this.actionItems);
  }

  setDecision(itemId: string, decision: 'approve' | 'delegate' | 'dismiss'): void {
    const current = this.decisionsSubject.value;
    this.decisionsSubject.next({ ...current, [itemId]: decision });
  }

  getDecisions(): Observable<{ [id: string]: 'approve' | 'delegate' | 'dismiss' }> {
    return this.decisionsSubject.asObservable();
  }

  resetDecisions(): void {
    this.decisionsSubject.next({});
  }
}
