import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HistoricoItem } from './models';

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  getItems(): Observable<HistoricoItem[]> {
    return of(MOCK_HISTORICO);
  }
}

const MOCK_HISTORICO: HistoricoItem[] = [
  {
    id: 'h1',
    departmentId: 'financeiro',
    departmentName: 'Financeiro',
    departmentColorVariant: 'fin',
    query: 'Análise de receita por produto — outubro 2025',
    agentCount: 3,
    rowCount: 1482,
    createdAt: new Date().toISOString(),
    canContinue: true,
    messages: [
      {
        id: 'm1', role: 'user',
        content: 'Análise de receita por produto — outubro 2025',
        timestamp: '09:38',
      },
      {
        id: 'm2', role: 'agent',
        agentName: 'Agente de Fluxo de Caixa',
        agentColor: '#EC0000', agentIconType: 'dollar',
        content: `Receita de **R$ 4,2M** — 8% acima da meta mensal.
Produto **Crédito Imobiliário** cresce +18% impulsionado por XPTO Incorporações.
**Delta Exportações** recuou -21% em Câmbio & Trade Finance — risco de churn.`,
        timestamp: '09:41', rowCount: 1482, status: 'done',
      },
      {
        id: 'm3', role: 'agent',
        agentName: 'Agente de Risco',
        agentColor: '#1565C0', agentIconType: 'shield',
        content: `**2 contratos** com vencimento em 30 dias sem renovação iniciada.
Inadimplência em **1,2%** — abaixo da meta. Compliance em **100%**.`,
        timestamp: '09:41', rowCount: 644, status: 'done',
      },
      {
        id: 'm4', role: 'conclusion',
        content: `Departamento opera acima da meta. Ação prioritária: **contato com Delta Exportações** e **renovação dos 2 contratos** antes do fechamento.`,
        timestamp: '09:42',
      },
    ],
  },
  {
    id: 'h2',
    departmentId: 'bacen',
    departmentName: 'Bacen',
    departmentColorVariant: 'bac',
    query: 'Status dos lotes SCR pendentes e risco de autuação',
    agentCount: 3, rowCount: 89,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    canContinue: true,
    messages: [
      { id: 'm1', role: 'user',
        content: 'Status dos lotes SCR pendentes e risco de autuação',
        timestamp: '08:21' },
      { id: 'm2', role: 'agent',
        agentName: 'Agente SCR', agentColor: '#8E24AA', agentIconType: 'database',
        content: `**2 lotes SCR** com envio atrasado ao Banco Central.
Lote #447 e Lote #451 com inconsistência de CPF.
Risco de **autuação automática** se não regularizados até sexta-feira.`,
        timestamp: '08:24', rowCount: 89, status: 'done' },
      { id: 'm3', role: 'conclusion',
        content: `**Ação imediata**: regularizar os 2 lotes SCR antes de sexta-feira para evitar autuação do Banco Central.`,
        timestamp: '08:25' },
    ],
  },
  {
    id: 'h3',
    departmentId: 'investimentos',
    departmentName: 'Investimentos',
    departmentColorVariant: 'inv',
    query: 'Quais fundos estão com resgates acima do esperado?',
    agentCount: 3, rowCount: 2108,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    canContinue: false,
    messages: [
      { id: 'm1', role: 'user',
        content: 'Quais fundos estão com resgates acima do esperado?',
        timestamp: '16:44' },
      { id: 'm2', role: 'agent',
        agentName: 'Agente de Portfólio', agentColor: '#2E7D32', agentIconType: 'pie-chart',
        content: `**4 fundos** com resgates acima do esperado:
Fundo Multimercado Alpha (-R$ 2,1M), Renda Variável Beta (-R$ 1,4M),
FIA Gamma (-R$ 0,9M) e FIM Delta (-R$ 0,6M).`,
        timestamp: '16:47', rowCount: 2108, status: 'done' },
    ],
  },
  {
    id: 'h4',
    departmentId: 'cadastro',
    departmentName: 'Cadastro',
    departmentColorVariant: 'cad',
    query: 'Pendências documentais acima de 30 dias sem resposta',
    agentCount: 3, rowCount: 847,
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    canContinue: false,
    messages: [
      { id: 'm1', role: 'user',
        content: 'Pendências documentais acima de 30 dias sem resposta',
        timestamp: '14:12' },
      { id: 'm2', role: 'agent',
        agentName: 'Agente de Documentação', agentColor: '#1565C0', agentIconType: 'file-text',
        content: `**142 pendências** com mais de 30 dias sem resposta do cliente.
Candidatas a arquivamento automático após protocolo de notificação.`,
        timestamp: '14:15', rowCount: 847, status: 'done' },
    ],
  },
  {
    id: 'h5',
    departmentId: 'emprestimo',
    departmentName: 'Empréstimo',
    departmentColorVariant: 'emp',
    query: 'Tomadores com sinais de deterioração financeira',
    agentCount: 3, rowCount: 312,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    canContinue: false,
    messages: [
      { id: 'm1', role: 'user',
        content: 'Tomadores com sinais de deterioração financeira',
        timestamp: '11:30' },
      { id: 'm2', role: 'agent',
        agentName: 'Agente de Cobrança', agentColor: '#F57F17', agentIconType: 'alert-circle',
        content: `**3 grandes tomadores** com sinais de deterioração:
Score de crédito caiu >50 pontos nos últimos 90 dias.
Exposição combinada: **R$ 8,4M** — requer monitoramento especial.`,
        timestamp: '11:33', rowCount: 312, status: 'done' },
    ],
  },
];
