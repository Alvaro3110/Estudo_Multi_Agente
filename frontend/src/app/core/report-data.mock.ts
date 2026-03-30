import { RevenueItem } from '../shared/components/product-revenue-chart/product-revenue-chart.component';
import { CustomerRow } from '../shared/components/customer-status-table/customer-status-table.component';

export interface AgentReportData {
  agentName: string;
  timestamp: string;
  reportTitle: string;
  description: string;
  revenueData: RevenueItem[];
  customerData: CustomerRow[];
  footerInsight: string;
}

export const MOCK_REPORTS: Record<string, AgentReportData> = {
  a1: {
    agentName: 'Agente de Fluxo de Caixa',
    timestamp: 'há 2 min',
    reportTitle: 'Análise de receita por produto — outubro 2025',
    description: `O gráfico abaixo mostra a distribuição de receita bruta por linha de produto no mês de outubro. 
      O produto <strong>Crédito Consignado</strong> representa a maior fatia da receita com <strong>R$ 1,82M</strong>, 
      seguido por <strong>Conta Corrente PJ</strong> com <strong>R$ 980K</strong>.`,
    revenueData: [
      { label: 'Crédito Consignado', value: 'R$ 1.820K', percent: 85, trend: '+6%', color: '#EC0000' },
      { label: 'Conta Corrente PJ', value: 'R$ 980K', percent: 55, trend: '+3%', color: '#0070E0' },
      { label: 'Crédito Imobiliário', value: 'R$ 840K', percent: 45, trend: '+18%', color: '#43A047' },
      { label: 'Cartão Empresarial', value: 'R$ 550K', percent: 35, trend: '-4%', color: '#FB8C00' },
      { label: 'Câmbio & Trade Fina...', value: 'R$ 320K', percent: 20, trend: '0%', color: '#7E308E' }
    ],
    customerData: [
      { name: 'XPTO Incorporações', product: 'Crédito Imobiliário', volume: 'R$ 285K', var: '+34%', status: 'ativo' },
      { name: 'Grupo Alfa Logística', product: 'Crédito Consignado', volume: 'R$ 210K', var: '+8%', status: 'ativo' },
      { name: 'Beta Varejo S.A.', product: 'Cartão Empresarial', volume: 'R$ 142K', var: '-12%', status: 'atenção' },
      { name: 'Omega Tech LTDA', product: 'Conta Corrente PJ', volume: 'R$ 98K', var: '+2%', status: 'ativo' },
      { name: 'Delta Exportações', product: 'Câmbio & Trade Finance', volume: 'R$ 76K', var: '-21%', status: 'risco' }
    ],
    footerInsight: 'A tabela acima evidencia que o produto <strong>Crédito Imobiliário</strong> deve manter trajetória de crescimento no Q4.'
  },
  a2: {
    agentName: 'Agente de Risco',
    timestamp: 'há 5 min',
    reportTitle: 'Relatório de Compliance e Exposição — Q3',
    description: `Análise detalhada da exposição de crédito e aderência regulatória. 
      Identificamos que <strong>98% da carteira</strong> está em conformidade com as novas normas do BACEN, 
      com apenas <strong>2 contratos</strong> em fase de renegociação.`,
    revenueData: [
      { label: 'Rating AA/A', value: 'R$ 12.5M', percent: 90, trend: '+2%', color: '#2E7D32' },
      { label: 'Rating B', value: 'R$ 2.1M', percent: 30, trend: '-5%', color: '#FB8C00' },
      { label: 'Rating C/D', value: 'R$ 450K', percent: 10, trend: '+1%', color: '#C62828' }
    ],
    customerData: [
      { name: 'Construtora Forte', product: 'Garantia Fiança', volume: 'R$ 1.2M', var: '0%', status: 'ativo' },
      { name: 'Indústrias Metal', product: 'Capital de Giro', volume: 'R$ 850K', var: '-5%', status: 'atenção' },
      { name: 'Supermercado Sol', product: 'Vendor', volume: 'R$ 320K', var: '+10%', status: 'ativo' }
    ],
    footerInsight: 'O índice de Basiléia permanece confortável em 17.5%, permitindo expansão seletiva no segmento Corporate.'
  },
  a3: {
    agentName: 'Agente de Investimentos',
    timestamp: 'em andamento',
    reportTitle: 'Performance do Portfólio de Alta Renda',
    description: `O portfólio consolidado apresentou rentabilidade de <strong>112% do CDI</strong> no período. 
      Houve uma migração estratégica de <strong>Renda Variável</strong> para <strong>Títulos Públicos</strong> 
      devido à volatilidade recente do mercado externo.`,
    revenueData: [
      { label: 'Renda Fixa', value: 'R$ 45.2M', percent: 75, trend: '+1.5%', color: '#01579B' },
      { label: 'Fundos Multi', value: 'R$ 12.8M', percent: 40, trend: '+0.8%', color: '#0288D1' },
      { label: 'Ações/FIIs', value: 'R$ 8.4M', percent: 25, trend: '-3.2%', color: '#03A9F4' }
    ],
    customerData: [
      { name: 'Família Oliveira', product: 'LCI/LCA', volume: 'R$ 4.2M', var: '+2%', status: 'ativo' },
      { name: 'Holding Patrimonial', product: 'COE', volume: 'R$ 2.8M', var: '+15%', status: 'ativo' },
      { name: 'Carlos Alberto S.', product: 'Fundo Ações', volume: 'R$ 1.1M', var: '-8%', status: 'risco' }
    ],
    footerInsight: 'Recomendamos manter o hedge em dólar para clientes com exposição acima de 20% em ativos offshore.'
  },
  a4: {
    agentName: 'Agente de Previsão',
    timestamp: 'há 8 min',
    reportTitle: 'Projeção de Fluxo e Cenários Macroeconômicos',
    description: `Nossa projeção indica um <strong>crescimento de 6,5%</strong> no volume de negócios para o próximo trimestre. 
      O cenário base contempla a manutenção da taxa Selic, o que favorece o <strong>crédito parcelado</strong>.`,
    revenueData: [
      { label: 'Cenário Otimista', value: 'R$ 5.1M', percent: 95, trend: '+12%', color: '#4CAF50' },
      { label: 'Cenário Base', value: 'R$ 4.5M', percent: 70, trend: '+6%', color: '#2196F3' },
      { label: 'Cenário Pessimista', value: 'R$ 3.8M', percent: 40, trend: '-2%', color: '#F44336' }
    ],
    customerData: [
      { name: 'Setor Agrícola', product: 'Forecast Q4', volume: 'R$ 15M', var: '+10%', status: 'ativo' },
      { name: 'Varejo Eletrônico', product: 'Forecast Natal', volume: 'R$ 22M', var: '+25%', status: 'ativo' }
    ],
    footerInsight: 'A reserva de liquidez deve ser reforçada em 15% para suportar o aumento sazonal de demanda no final do ano.'
  }
};
