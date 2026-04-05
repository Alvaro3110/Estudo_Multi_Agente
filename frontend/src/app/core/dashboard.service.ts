import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Department, DeptReportConfig, DeptAgent } from './models';
export { Department };

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
    {
      id: 'clusterizacao',
      name: 'Clusterização',
      iconType: 'cluster',
      efficiency: 96,
      status: 'ready',
      summary: 'Segmentação da base atualizada com cobertura elevada. Há clientes sem cluster definido que impactam a personalização de ofertas e a régua de relacionamento.',
      metrics: [
        { label: 'Clusters ativos',  value: '14',     trend: 'neutral' },
        { label: 'Cobertura base',   value: '94,2%',  trend: 'up'      },
        { label: 'Precisão modelo',  value: '91%',    trend: 'up'      },
      ],
      indicators: [
        { label: 'Segmentação atualizada',        value: '94,2% ✓',        status: 'green'  },
        { label: 'Clientes sem cluster',          value: '1.243 pendentes', status: 'yellow' },
        { label: 'Modelo retreinado (dias)',       value: '18 dias atrás',  status: 'yellow' },
        { label: 'Clusters com baixa cobertura',  value: '2 críticos',     status: 'red'    },
      ],
    },
  
    {
      id: 'garantias',
      name: 'Garantias',
      iconType: 'shield',
      efficiency: 93,
      status: 'ready',
      summary: 'Carteira de garantias com cobertura adequada, mas com contratos próximos do vencimento sem renovação iniciada. Valor em risco requer ação imediata da equipe jurídica.',
      metrics: [
        { label: 'Valor total',    value: 'R$ 82M',  trend: 'up'      },
        { label: 'Cobertura',      value: '108%',    trend: 'neutral' },
        { label: 'Eficiência',     value: '93%',     trend: 'neutral' },
      ],
      indicators: [
        { label: 'Cobertura da carteira',         value: '108% ✓',          status: 'green'  },
        { label: 'Contratos vencendo em 30 dias', value: '7 contratos',      status: 'red'    },
        { label: 'Garantias em reavaliação',      value: '12 pendentes',     status: 'yellow' },
        { label: 'Valor em risco descoberto',     value: 'R$ 4,1M crítico',  status: 'red'    },
      ],
    },
  
    {
      id: 'financeiro',
      name: 'Financeiro',
      iconType: 'dollar',
      efficiency: 98,
      status: 'ready',
      summary: 'Departamento opera acima da meta de receita com margem estável. Há 1 alerta crítico em câmbio e 2 contratos próximos do vencimento que requerem atenção.',
      metrics: [
        { label: 'Receita mês',     value: 'R$ 4,2M', trend: 'up'      },
        { label: 'Margem líquida',  value: '22,4%',   trend: 'neutral' },
        { label: 'Eficiência',      value: '98%',     trend: 'up'      },
      ],
      indicators: [
        { label: 'Receita bruta mensal',      value: '↑ acima da meta',  status: 'green'  },
        { label: 'Despesas operacionais',     value: '+3,1% monitorar',  status: 'yellow' },
        { label: 'Câmbio — Delta Exportações',value: '-21% crítico',     status: 'red'    },
        { label: 'Compliance regulatório',    value: '100% ✓',           status: 'green'  },
      ],
    },
  
    {
      id: 'rentabilidade',
      name: 'Rentabilidade',
      iconType: 'trending',
      efficiency: 97,
      status: 'ready',
      summary: 'ROE acima do benchmark setorial com captação crescente. Custo de capital elevado pressiona a margem em produtos de crédito de longo prazo.',
      metrics: [
        { label: 'ROE',             value: '18,4%',   trend: 'up'      },
        { label: 'Margem bruta',    value: '31,2%',   trend: 'neutral' },
        { label: 'Eficiência',      value: '97%',     trend: 'up'      },
      ],
      indicators: [
        { label: 'ROE vs benchmark',           value: '+2,1pp acima ✓',   status: 'green'  },
        { label: 'Custo de captação',          value: '+0,8% atenção',    status: 'yellow' },
        { label: 'Produtos abaixo da meta',    value: '3 produtos',       status: 'yellow' },
        { label: 'Margem crédito longo prazo', value: 'Comprimida',       status: 'red'    },
      ],
    },
  
    {
      id: 'socio',
      name: 'Sócio',
      iconType: 'user-check',
      efficiency: 95,
      status: 'ready',
      summary: 'Base de sócios estável com alta taxa de renovação. Atenção para sócios com dados desatualizados e um lote de renovações com prazo crítico nos próximos 15 dias.',
      metrics: [
        { label: 'Sócios ativos',  value: '3.841',   trend: 'up'      },
        { label: 'Renovações mês', value: '214',     trend: 'neutral' },
        { label: 'Inadimplência',  value: '1,8%',    trend: 'down'    },
      ],
      indicators: [
        { label: 'Taxa de renovação',             value: '94% ✓',            status: 'green'  },
        { label: 'Sócios com dados desatualizados',value: '387 pendentes',    status: 'yellow' },
        { label: 'Renovações críticas (15 dias)', value: '62 vencendo',       status: 'red'    },
        { label: 'Inadimplência de mensalidade',  value: '1,8% controlado',  status: 'green'  },
      ],
    },
  
    {
      id: 'cadastro',
      name: 'Cadastro',
      iconType: 'file-text',
      efficiency: 91,
      status: 'ready',
      summary: 'Volume de novos cadastros em alta, mas com pendências documentais acumuladas. A taxa de cadastros incompletos está acima do limite aceitável e requer triagem.',
      metrics: [
        { label: 'Cadastros ativos',  value: '28.441', trend: 'up'      },
        { label: 'Novos este mês',    value: '1.203',  trend: 'up'      },
        { label: 'Pendências',        value: '847',    trend: 'down'    },
      ],
      indicators: [
        { label: 'Cadastros completos',          value: '96,8% ✓',          status: 'green'  },
        { label: 'Documentação pendente',        value: '847 aguardando',   status: 'yellow' },
        { label: 'Cadastros incompletos',        value: '3,2% crítico',     status: 'red'    },
        { label: 'Tempo médio de aprovação',     value: '1,4 dias ✓',       status: 'green'  },
      ],
    },
  
    {
      id: 'emprestimo',
      name: 'Empréstimo',
      iconType: 'credit-card',
      efficiency: 94,
      status: 'ready',
      summary: 'Carteira de crédito saudável com crescimento consistente. A inadimplência está dentro do limite, mas 3 grandes tomadores apresentam sinais de deterioração.',
      metrics: [
        { label: 'Carteira total',  value: 'R$ 124M', trend: 'up'      },
        { label: 'Inadimplência',   value: '2,3%',    trend: 'neutral' },
        { label: 'Aprovações/mês',  value: '1.847',   trend: 'up'      },
      ],
      indicators: [
        { label: 'Crescimento da carteira',     value: '+8,4% mês ✓',      status: 'green'  },
        { label: 'Inadimplência geral',         value: '2,3% dentro limite',status: 'green'  },
        { label: 'Tomadores em deterioração',   value: '3 monitorar',      status: 'yellow' },
        { label: 'Operações em atraso +90d',    value: 'R$ 2,8M crítico',  status: 'red'    },
      ],
    },
  
    {
      id: 'investimentos',
      name: 'Investimentos',
      iconType: 'pie-chart',
      efficiency: 98,
      status: 'ready',
      summary: 'Portfólio com rentabilidade acima do benchmark. Captação líquida positiva no mês, mas volatilidade no mercado de renda variável exige revisão de alocação.',
      metrics: [
        { label: 'AUM total',       value: 'R$ 340M', trend: 'up'      },
        { label: 'Captação líquida',value: 'R$ 12M',  trend: 'up'      },
        { label: 'Rentab. média',   value: '+12,8%',  trend: 'up'      },
      ],
      indicators: [
        { label: 'Rentabilidade vs CDI',         value: '+2,3pp acima ✓',   status: 'green'  },
        { label: 'Captação líquida mensal',      value: 'R$ 12M positiva',  status: 'green'  },
        { label: 'Renda variável — volatilidade',value: 'Elevada revisar',  status: 'yellow' },
        { label: 'Resgates acima do esperado',   value: '4 fundos críticos', status: 'red'    },
      ],
    },
  
    {
      id: 'bacen',
      name: 'Bacen',
      iconType: 'landmark',
      efficiency: 99,
      status: 'ready',
      summary: 'Obrigações regulatórias em dia com o Banco Central. Há pendências no envio do SCR e uma nota técnica de conformidade com prazo próximo que requer validação.',
      metrics: [
        { label: 'Conformidade',    value: '99,1%',   trend: 'up'      },
        { label: 'Pendências BCB',  value: '2',       trend: 'neutral' },
        { label: 'Próx. prazo',     value: '8 dias',  trend: 'down'    },
      ],
      indicators: [
        { label: 'Relatórios enviados no prazo', value: '100% ✓',           status: 'green'  },
        { label: 'Envio SCR pendente',           value: '2 lotes atrasados',status: 'red'    },
        { label: 'Nota técnica conformidade',    value: 'Prazo: 8 dias',    status: 'yellow' },
        { label: 'Multas regulatórias abertas',  value: 'Nenhuma ✓',        status: 'green'  },
      ],
    }
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

  getReportConfig(deptId: string): Observable<DeptReportConfig> {
    const config = REPORT_CONFIGS.find(c => c.deptId === deptId) || REPORT_CONFIGS[2]; // fallback to Financeiro
    return of(config);
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

const REPORT_CONFIGS: DeptReportConfig[] = [
  {
    deptId: 'clusterizacao',
    deptName: 'Clusterização',
    iconType: 'cluster',
    iconColor: '#7B1FA2',
    iconBg: '#F3E5F5',
    badgeText: '2 clusters críticos',
    badgeVariant: 'warn',
    kpis: [
      { label: 'Clusters ativos',  value: '14',    trend: 'neutral' },
      { label: 'Cobertura base',   value: '94,2%', trend: 'up'      },
      { label: 'Precisão modelo',  value: '91%',   trend: 'up'      },
    ],
    agents: [
      {
        id: 'ag-segmentacao',
        name: 'Agente de Segmentação',
        color: '#7B1FA2',
        iconType: 'cluster',
        pillVariant: 'purple',
        status: 'done',
        rowCount: 28441,
        report: `A segmentação da base foi atualizada com **94,2% de cobertura**. 
Os 14 clusters ativos apresentam distribuição equilibrada, com 2 clusters 
de baixa densidade que impactam a personalização de ofertas. 
O cluster **"Alta Renda Inativa"** está com apenas 61% dos membros 
esperados — recomenda-se revisão dos critérios de elegibilidade.`,
      },
      {
        id: 'ag-modelo',
        name: 'Agente de Modelo',
        color: '#1565C0',
        iconType: 'cpu',
        pillVariant: 'blue',
        status: 'done',
        rowCount: 1243,
        report: `Modelo de clusterização com **91% de precisão** — acima do benchmark 
de 85%. O modelo foi retreinado há **18 dias**; próximo ciclo recomendado 
em 12 dias para manter acurácia. **1.243 clientes** sem cluster definido 
aguardam reclassificação manual.`,
      },
      {
        id: 'ag-oferta',
        name: 'Agente de Oferta',
        color: '#2E7D32',
        iconType: 'tag',
        pillVariant: 'green',
        status: 'done',
        rowCount: 892,
        report: `Régua de relacionamento ativa para **12 dos 14 clusters**. 
Taxa de conversão de ofertas personalizadas em **8,4%** — 
2,1pp acima da oferta genérica. Clientes sem cluster recebem 
**zero personalização**, impactando diretamente a receita de cross-sell.`,
      },
    ],
    indicators: [
      { label: 'Segmentação atualizada',       value: '94,2% ✓',         status: 'green'  },
      { label: 'Clientes sem cluster',         value: '1.243 pendentes', status: 'yellow' },
      { label: 'Modelo retreinado (dias)',      value: '18 dias atrás',   status: 'yellow' },
      { label: 'Clusters com baixa cobertura', value: '2 críticos',      status: 'red'    },
    ],
    summaryAfterReport: `A base está bem segmentada, mas os **1.243 clientes sem cluster** 
e os **2 clusters críticos** representam oportunidade perdida de personalização. 
Recomenda-se reclassificação manual prioritária e retreinamento do modelo em até 12 dias.`,
  },
  {
    deptId: 'garantias',
    deptName: 'Garantias',
    iconType: 'shield',
    iconColor: '#EC0000',
    iconBg: '#FEF0F0',
    badgeText: 'R$ 4,1M em risco',
    badgeVariant: 'error',
    kpis: [
      { label: 'Valor total',  value: 'R$ 82M', trend: 'up'      },
      { label: 'Cobertura',    value: '108%',   trend: 'neutral' },
      { label: 'Vencendo/30d', value: '7',      trend: 'down'    },
    ],
    agents: [
      {
        id: 'ag-carteira-gar',
        name: 'Agente de Carteira',
        color: '#EC0000',
        iconType: 'shield',
        pillVariant: 'red',
        status: 'done',
        rowCount: 1847,
        report: `Carteira de garantias totaliza **R$ 82M** com cobertura de **108%** 
da exposição total — dentro do limite regulatório. Porém, **7 contratos** 
com garantias atreladas vencem nos próximos 30 dias sem processo de 
renovação iniciado, representando exposição de **R$ 4,1M descoberto**.`,
      },
      {
        id: 'ag-avaliacao',
        name: 'Agente de Avaliação',
        color: '#F57F17',
        iconType: 'search',
        pillVariant: 'amber',
        status: 'done',
        rowCount: 312,
        report: `**12 garantias** estão em processo de reavaliação por desatualização 
de laudo. Valor estimado em reavaliação: **R$ 14,3M**. 
Prazo médio de reavaliação: 22 dias úteis. 
Recomenda-se acionar equipe jurídica para contratos críticos imediatamente.`,
      },
      {
        id: 'ag-juridico',
        name: 'Agente Jurídico',
        color: '#1565C0',
        iconType: 'file-text',
        pillVariant: 'blue',
        status: 'done',
        rowCount: 89,
        report: `Nenhum processo judicial ativo relacionado a garantias. 
**3 notificações extrajudiciais** enviadas aguardam resposta. 
Conformidade com as normas do BACEN para constituição de garantias 
está em **100%** dos contratos auditados neste período.`,
      },
    ],
    indicators: [
      { label: 'Cobertura da carteira',         value: '108% ✓',          status: 'green'  },
      { label: 'Contratos vencendo em 30 dias', value: '7 contratos',      status: 'red'    },
      { label: 'Garantias em reavaliação',      value: '12 pendentes',     status: 'yellow' },
      { label: 'Valor em risco descoberto',     value: 'R$ 4,1M crítico',  status: 'red'    },
    ],
    summaryAfterReport: `A cobertura geral está adequada, mas os **7 contratos** com 
vencimento iminente sem renovação e o valor de **R$ 4,1M descoberto** 
exigem ação imediata da equipe jurídica e de relacionamento.`,
  },
  {
    deptId: 'financeiro',
    deptName: 'Financeiro',
    iconType: 'dollar',
    iconColor: '#EC0000',
    iconBg: '#FEF0F0',
    badgeText: '1 alerta crítico',
    badgeVariant: 'warn',
    kpis: [
      { label: 'Receita mês',    value: 'R$ 4,2M', trend: 'up'      },
      { label: 'Margem líquida', value: '22,4%',   trend: 'neutral' },
      { label: 'Processos',      value: '1.482',   trend: 'up'      },
    ],
    agents: [
      {
        id: 'ag-fluxo',
        name: 'Agente de Fluxo de Caixa',
        color: '#EC0000',
        iconType: 'dollar',
        pillVariant: 'red',
        status: 'done',
        rowCount: 1482,
        report: `Receita de **R$ 4,2M** — 8% acima da meta mensal. 
Produto **Crédito Imobiliário** cresce +18% impulsionado por XPTO Incorporações. 
**Delta Exportações** recuou -21% em Câmbio & Trade Finance, 
sinalizando risco de churn que requer contato comercial imediato.`,
      },
      {
        id: 'ag-risco-fin',
        name: 'Agente de Risco',
        color: '#1565C0',
        iconType: 'alert',
        pillVariant: 'blue',
        status: 'done',
        rowCount: 644,
        report: `**2 contratos** com cláusulas próximas do vencimento sem renovação 
iniciada — exposição combinada de **R$ 1,2M**. 
Inadimplência em **1,2%** — abaixo da meta de 2%. 
Compliance regulatório em **100%** das operações auditadas.`,
      },
      {
        id: 'ag-compliance-fin',
        name: 'Agente de Compliance',
        color: '#2E7D32',
        iconType: 'check',
        pillVariant: 'green',
        status: 'done',
        rowCount: 211,
        report: `Todas as obrigações fiscais e contábeis do período estão regularizadas. 
**Despesas operacionais** cresceram 3,1% — dentro do limite de alerta (5%). 
Margem líquida estável em **22,4%** — sem deterioração relevante.`,
      },
    ],
    indicators: [
      { label: 'Receita bruta mensal',       value: '↑ acima da meta',  status: 'green'  },
      { label: 'Despesas operacionais',      value: '+3,1% monitorar',  status: 'yellow' },
      { label: 'Câmbio — Delta Exportações', value: '-21% crítico',     status: 'red'    },
      { label: 'Compliance regulatório',     value: '100% ✓',           status: 'green'  },
    ],
    summaryAfterReport: `O departamento opera acima da meta de receita com margem estável. 
A ação prioritária é o **contato comercial com Delta Exportações** e 
a **renovação dos 2 contratos** vencendo antes do fechamento do mês.`,
  },
  {
    deptId: 'rentabilidade',
    deptName: 'Rentabilidade',
    iconType: 'trending',
    iconColor: '#1565C0',
    iconBg: '#E3F2FD',
    badgeText: 'ROE acima do benchmark',
    badgeVariant: 'ok',
    kpis: [
      { label: 'ROE',          value: '18,4%',  trend: 'up'      },
      { label: 'Margem bruta', value: '31,2%',  trend: 'neutral' },
      { label: 'AUM captado',  value: 'R$ 12M', trend: 'up'      },
    ],
    agents: [
      {
        id: 'ag-roe',
        name: 'Agente de ROE',
        color: '#1565C0',
        iconType: 'trending',
        pillVariant: 'blue',
        status: 'done',
        rowCount: 3841,
        report: `ROE de **18,4%** — 2,1pp acima do benchmark setorial de 16,3%. 
Carteira de produtos de alta rentabilidade cresceu **9,2%** no trimestre. 
**3 produtos** estão abaixo da meta individual de rentabilidade 
e precisam de revisão de precificação ou descontinuação.`,
      },
      {
        id: 'ag-capital',
        name: 'Agente de Capital',
        color: '#F57F17',
        iconType: 'pie-chart',
        pillVariant: 'amber',
        status: 'done',
        rowCount: 892,
        report: `Custo de captação subiu **0,8pp** no trimestre, pressionando 
a margem em produtos de crédito longo prazo. 
Índice de Basileia em **14,2%** — confortavelmente acima do mínimo regulatório de 10,5%. 
Eficiência operacional em **97%**, melhor resultado do ano.`,
      },
      {
        id: 'ag-produto-rent',
        name: 'Agente de Produtos',
        color: '#2E7D32',
        iconType: 'bar-chart',
        pillVariant: 'green',
        status: 'done',
        rowCount: 214,
        report: `Mix de produtos favorável com **crédito imobiliário e consignado** 
respondendo por 68% da receita. 
Produtos de **baixa rentabilidade** como conta corrente básica 
contribuem com alto volume mas margem negativa — 
recomenda-se cross-sell agressivo para migração de perfil.`,
      },
    ],
    indicators: [
      { label: 'ROE vs benchmark',            value: '+2,1pp acima ✓',  status: 'green'  },
      { label: 'Custo de captação',            value: '+0,8% atenção',   status: 'yellow' },
      { label: 'Produtos abaixo da meta',      value: '3 produtos',      status: 'yellow' },
      { label: 'Margem crédito longo prazo',   value: 'Comprimida',      status: 'red'    },
    ],
    summaryAfterReport: `Rentabilidade global saudável com ROE acima do mercado. 
O foco deve ser na **revisão dos 3 produtos deficitários** e na 
**estratégia de captação** para conter a pressão no custo de funding.`,
  },
  {
    deptId: 'socio',
    deptName: 'Sócio',
    iconType: 'user-check',
    iconColor: '#EC0000',
    iconBg: '#FEF0F0',
    badgeText: '62 renovações críticas',
    badgeVariant: 'warn',
    kpis: [
      { label: 'Sócios ativos',  value: '3.841',  trend: 'up'      },
      { label: 'Renovações/mês', value: '214',    trend: 'neutral' },
      { label: 'Inadimplência',  value: '1,8%',   trend: 'neutral' },
    ],
    agents: [
      {
        id: 'ag-socio-base',
        name: 'Agente de Base',
        color: '#EC0000',
        iconType: 'users',
        pillVariant: 'red',
        status: 'done',
        rowCount: 3841,
        report: `Base de **3.841 sócios ativos** com crescimento de 2,3% no trimestre. 
Taxa de renovação em **94%** — dentro da meta. 
**62 renovações** vencem nos próximos 15 dias sem contato realizado, 
concentradas nos perfis "Bronze" e "Prata".`,
      },
      {
        id: 'ag-cadastro-socio',
        name: 'Agente de Cadastro',
        color: '#F57F17',
        iconType: 'file-text',
        pillVariant: 'amber',
        status: 'done',
        rowCount: 387,
        report: `**387 sócios** com dados cadastrais desatualizados — 
endereço, telefone ou e-mail incorretos. Isso impacta diretamente 
a comunicação de renovação e benefícios. 
Campanha de atualização cadastral ativa atingiu apenas **31%** da meta.`,
      },
      {
        id: 'ag-beneficio',
        name: 'Agente de Benefícios',
        color: '#2E7D32',
        iconType: 'gift',
        pillVariant: 'green',
        status: 'done',
        rowCount: 1203,
        report: `Utilização de benefícios em **68%** da base ativa — acima da meta de 60%. 
Benefício mais acessado: **desconto em seguros** (42% dos sócios). 
Sócios que utilizam benefícios têm taxa de renovação **18pp** superior 
aos que não utilizam — oportunidade clara de engajamento.`,
      },
    ],
    indicators: [
      { label: 'Taxa de renovação',              value: '94% ✓',            status: 'green'  },
      { label: 'Dados cadastrais desatualizados', value: '387 pendentes',    status: 'yellow' },
      { label: 'Renovações críticas (15 dias)',  value: '62 vencendo',       status: 'red'    },
      { label: 'Inadimplência de mensalidade',   value: '1,8% controlado',  status: 'green'  },
    ],
    summaryAfterReport: `Base saudável com boa taxa de renovação. A prioridade imediata é 
o **contato ativo com os 62 sócios** com renovação crítica nos próximos 15 dias 
e a **atualização dos 387 cadastros** desatualizados.`,
  },
  {
    deptId: 'cadastro',
    deptName: 'Cadastro',
    iconType: 'file-text',
    iconColor: '#F57F17',
    iconBg: '#FFF8E1',
    badgeText: '847 pendências doc.',
    badgeVariant: 'warn',
    kpis: [
      { label: 'Cadastros ativos', value: '28.441', trend: 'up'      },
      { label: 'Novos este mês',   value: '1.203',  trend: 'up'      },
      { label: 'Pendências',       value: '847',    trend: 'down'    },
    ],
    agents: [
      {
        id: 'ag-cadastro-base',
        name: 'Agente de Cadastro',
        color: '#F57F17',
        iconType: 'file-text',
        pillVariant: 'amber',
        status: 'done',
        rowCount: 28441,
        report: `**1.203 novos cadastros** neste mês — crescimento de 12% vs mês anterior. 
Taxa de conclusão em **96,8%** — acima da meta de 95%. 
**847 documentações** pendentes acumuladas, concentradas em pessoa jurídica 
que exige documentação adicional de quadro societário.`,
      },
      {
        id: 'ag-doc',
        name: 'Agente de Documentação',
        color: '#1565C0',
        iconType: 'folder',
        pillVariant: 'blue',
        status: 'done',
        rowCount: 847,
        report: `Das **847 pendências**, 612 são por falta de comprovante de renda atualizado 
e 235 por documentos societários incompletos. 
Tempo médio de resolução: **3,2 dias** após notificação ao cliente. 
**142 pendências** estão com mais de 30 dias sem resposta — 
candidatas a arquivamento automático.`,
      },
      {
        id: 'ag-aprovacao',
        name: 'Agente de Aprovação',
        color: '#EC0000',
        iconType: 'check-circle',
        pillVariant: 'red',
        status: 'done',
        rowCount: 1203,
        report: `Tempo médio de aprovação: **1,4 dias** — dentro da meta de 2 dias. 
Taxa de reprovação por inconsistência cadastral: **3,2%**. 
**29 cadastros** aguardam aprovação manual por risco elevado 
e precisam de análise do comitê de crédito.`,
      },
    ],
    indicators: [
      { label: 'Cadastros completos',       value: '96,8% ✓',          status: 'green'  },
      { label: 'Documentação pendente',     value: '847 aguardando',   status: 'yellow' },
      { label: 'Cadastros incompletos',     value: '3,2% crítico',     status: 'red'    },
      { label: 'Tempo médio de aprovação',  value: '1,4 dias ✓',       status: 'green'  },
    ],
    summaryAfterReport: `Volume crescente de cadastros com boa taxa de conclusão. 
O gargalo está nas **847 pendências documentais** — 
prioridade para as **142 com mais de 30 dias** sem resposta 
e os **29 aguardando comitê** de crédito.`,
  },
  {
    deptId: 'emprestimo',
    deptName: 'Empréstimo',
    iconType: 'credit-card',
    iconColor: '#EC0000',
    iconBg: '#FEF0F0',
    badgeText: 'R$ 2,8M em atraso +90d',
    badgeVariant: 'error',
    kpis: [
      { label: 'Carteira total',  value: 'R$ 124M', trend: 'up'      },
      { label: 'Inadimplência',   value: '2,3%',    trend: 'neutral' },
      { label: 'Aprovações/mês',  value: '1.847',   trend: 'up'      },
    ],
    agents: [
      {
        id: 'ag-credito',
        name: 'Agente de Crédito',
        color: '#EC0000',
        iconType: 'credit-card',
        pillVariant: 'red',
        status: 'done',
        rowCount: 1847,
        report: `Carteira de **R$ 124M** com crescimento de **8,4% no mês**. 
**1.847 aprovações** em outubro — recorde do ano. 
Score médio dos aprovados: **742 pontos**. 
Concentração de crédito nos top 10 tomadores representa **34% da carteira** 
— acima do limite recomendado de 25%.`,
      },
      {
        id: 'ag-cobranca',
        name: 'Agente de Cobrança',
        color: '#F57F17',
        iconType: 'alert-circle',
        pillVariant: 'amber',
        status: 'done',
        rowCount: 312,
        report: `Inadimplência geral em **2,3%** — dentro do limite de alerta. 
**R$ 2,8M** em operações com atraso superior a 90 dias — 
passível de provisão integral. **3 grandes tomadores** 
apresentam sinais de deterioração financeira e estão em 
monitoramento especial pela área de risco.`,
      },
      {
        id: 'ag-risco-emp',
        name: 'Agente de Risco',
        color: '#1565C0',
        iconType: 'shield',
        pillVariant: 'blue',
        status: 'done',
        rowCount: 892,
        report: `Provisão para devedores duvidosos (PDD) em **R$ 4,1M** — 
cobertura de **146%** da inadimplência esperada. 
Concentração setorial: **42% em varejo e comércio** — 
avaliar diversificação em próximos comitês de crédito.`,
      },
    ],
    indicators: [
      { label: 'Crescimento da carteira',    value: '+8,4% mês ✓',       status: 'green'  },
      { label: 'Inadimplência geral',        value: '2,3% dentro limite', status: 'green'  },
      { label: 'Tomadores em deterioração',  value: '3 monitorar',        status: 'yellow' },
      { label: 'Operações em atraso +90d',   value: 'R$ 2,8M crítico',    status: 'red'    },
    ],
    summaryAfterReport: `Carteira saudável com crescimento consistente. 
O foco deve ser nos **3 tomadores em deterioração** e na 
**provisão do R$ 2,8M** em atraso +90d antes do fechamento contábil.`,
  },
  {
    deptId: 'investimentos',
    deptName: 'Investimentos',
    iconType: 'pie-chart',
    iconColor: '#2E7D32',
    iconBg: '#E8F5E9',
    badgeText: 'portfólio saudável',
    badgeVariant: 'ok',
    kpis: [
      { label: 'AUM total',        value: 'R$ 340M', trend: 'up'      },
      { label: 'Captação líquida', value: 'R$ 12M',  trend: 'up'      },
      { label: 'Rentab. média',    value: '+12,8%',  trend: 'up'      },
    ],
    agents: [
      {
        id: 'ag-portfolio',
        name: 'Agente de Portfólio',
        color: '#2E7D32',
        iconType: 'pie-chart',
        pillVariant: 'green',
        status: 'done',
        rowCount: 2108,
        report: `Portfólio com retorno de **+12,8% a.a.**, superando CDI em **2,3pp**. 
AUM total de **R$ 340M** com captação líquida positiva de **R$ 12M** no mês. 
**4 fundos** com resgates acima do esperado requerem análise 
de concentração e estratégia de retenção de clientes.`,
      },
      {
        id: 'ag-mercado',
        name: 'Agente de Mercado',
        color: '#F57F17',
        iconType: 'activity',
        pillVariant: 'amber',
        status: 'done',
        rowCount: 643,
        report: `Volatilidade de renda variável **elevada** no trimestre — 
Ibovespa com desvio padrão de 22% a.a. 
Recomenda-se revisão da alocação em **renda variável** 
para perfis conservadores. 
Renda fixa performando acima do esperado com **Selic alta**.`,
      },
      {
        id: 'ag-captacao',
        name: 'Agente de Captação',
        color: '#1565C0',
        iconType: 'trending-up',
        pillVariant: 'blue',
        status: 'done',
        rowCount: 1203,
        report: `Captação líquida de **R$ 12M** — melhor resultado do semestre. 
Top 3 produtos captadores: CDB pós-fixado (R$ 6,2M), 
Fundo Multimercado (R$ 3,8M) e LCI/LCA (R$ 2,0M). 
**Ticket médio** de novos investidores cresceu 14% — 
sinal de melhora no perfil da base.`,
      },
    ],
    indicators: [
      { label: 'Rentabilidade vs CDI',          value: '+2,3pp acima ✓',   status: 'green'  },
      { label: 'Captação líquida mensal',        value: 'R$ 12M positiva',  status: 'green'  },
      { label: 'Renda variável — volatilidade',  value: 'Elevada revisar',  status: 'yellow' },
      { label: 'Resgates acima do esperado',     value: '4 fundos críticos', status: 'red'    },
    ],
    summaryAfterReport: `Portfólio com excelente performance e captação positiva. 
O ponto de atenção são os **4 fundos** com resgates elevados 
e a necessidade de **revisão de alocação em renda variável** 
para clientes com perfil conservador.`,
  },
  {
    deptId: 'bacen',
    deptName: 'Bacen',
    iconType: 'landmark',
    iconColor: '#1565C0',
    iconBg: '#E3F2FD',
    badgeText: '2 pendências BCB',
    badgeVariant: 'warn',
    kpis: [
      { label: 'Conformidade',   value: '99,1%',  trend: 'up'      },
      { label: 'Pendências BCB', value: '2',      trend: 'neutral' },
      { label: 'Próx. prazo',    value: '8 dias', trend: 'down'    },
    ],
    agents: [
      {
        id: 'ag-regulatorio',
        name: 'Agente Regulatório',
        color: '#1565C0',
        iconType: 'landmark',
        pillVariant: 'blue',
        status: 'done',
        rowCount: 312,
        report: `Todos os **relatórios obrigatórios** foram enviados dentro do prazo. 
Conformidade regulatória em **99,1%** — acima do benchmark do setor. 
**Nota técnica de conformidade** com prazo de entrega em 
**8 dias úteis** aguarda validação e assinatura da diretoria.`,
      },
      {
        id: 'ag-scr',
        name: 'Agente SCR',
        color: '#7B1FA2',
        iconType: 'database',
        pillVariant: 'purple',
        status: 'done',
        rowCount: 89,
        report: `**2 lotes SCR** com envio atrasado ao Banco Central. 
Lote #447 (R$ 12,4M) e Lote #451 (R$ 8,1M) aguardam 
correção de inconsistência de CPF. 
Risco de autuação automática se não regularizados até **sexta-feira**. 
Nenhuma multa ou notificação formal aberta no momento.`,
      },
      {
        id: 'ag-conformidade',
        name: 'Agente de Conformidade',
        color: '#2E7D32',
        iconType: 'check-square',
        pillVariant: 'green',
        status: 'done',
        rowCount: 1847,
        report: `Auditoria interna em conformidade com as **Resoluções BCB 4.557 e 4.658**. 
Controles internos de prevenção à lavagem de dinheiro 
em **100% de aderência**. 
**Relatório CADOC** do trimestre entregue sem ressalvas. 
Próxima auditoria regulatória prevista para Q1 2027.`,
      },
    ],
    indicators: [
      { label: 'Relatórios enviados no prazo', value: '100% ✓',            status: 'green'  },
      { label: 'Envio SCR pendente',           value: '2 lotes atrasados', status: 'red'    },
      { label: 'Nota técnica conformidade',    value: 'Prazo: 8 dias',     status: 'yellow' },
      { label: 'Multas regulatórias abertas',  value: 'Nenhuma ✓',         status: 'green'  },
    ],
    summaryAfterReport: `Conformidade regulatória em nível elevado. 
A ação crítica e imediata é a **regularização dos 2 lotes SCR** 
ante de sexta-feira para evitar autuação automática do Banco Central.`,
  }
];

