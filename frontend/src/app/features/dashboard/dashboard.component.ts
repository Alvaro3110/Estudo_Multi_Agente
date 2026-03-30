import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { StepperComponent } from '../../shared/components/stepper/stepper.component';
import { SubheadComponent } from '../../shared/components/subhead/subhead.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { AgentDetailCardComponent, AgentInsight } from '../../shared/components/agent-detail-card/agent-detail-card.component';
import { SummaryBoxComponent } from '../../shared/components/summary-box/summary-box.component';
import { AgentReportViewComponent } from '../../shared/components/agent-report-view/agent-report-view.component';
import { PersonaService, PersonaType } from '../../core/persona.service';
import { MOCK_REPORTS, AgentReportData } from '../../core/report-data.mock';

export interface DetailedAgent {
  id: string;
  name: string;
  category: string;
  icon: string;
  iconBg: string;
  status: 'concluído' | 'analisando';
  insights: AgentInsight[];
  time: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    StepperComponent,
    SubheadComponent,
    KpiCardComponent,
    AgentDetailCardComponent,
    SummaryBoxComponent,
    AgentReportViewComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentStep: number = 1;
  personaType: PersonaType = 'gestor';
  personaLabel: string = '';
  selectedReport: AgentReportData | null = null;
  
  agents: DetailedAgent[] = [
    {
      id: 'a1',
      name: 'Agente de Fluxo de Caixa',
      category: 'Análise de receita e despesas',
      icon: '$',
      iconBg: '#FEEEEE',
      status: 'concluído',
      time: 'há 2 min',
      insights: [
        { boldPart: 'Receita do mês R$ 4,2M,', normalPart: '8% acima da projeção inicial.' },
        { boldPart: 'Dívida líquida estável:', normalPart: 'R$ 15,1M (índice 0,35x).' },
        { boldPart: 'Ciclo financeiro reduzido em 12 dias', normalPart: 'no último trimestre.' }
      ]
    },
    {
      id: 'a2',
      name: 'Agente de Risco',
      category: 'Exposição e compliance',
      icon: '📉',
      iconBg: '#E3F2FD',
      status: 'concluído',
      time: 'há 5 min',
      insights: [
        { boldPart: '2 contratos', normalPart: 'com cláusulas próximas do vencimento.' },
        { boldPart: 'Índice de inadimplência abaixo da meta: 1,2%.', normalPart: '' },
        { boldPart: 'Compliance regulatório em 100%', normalPart: 'das operações.' }
      ]
    },
    {
      id: 'a3',
      name: 'Agente de Investimentos',
      category: 'Portfólio e rentabilidade',
      icon: '📈',
      iconBg: '#E8F5E9',
      status: 'analisando',
      time: 'em andamento',
      insights: [
        { boldPart: 'Portfólio de renda fixa com retorno de +12,3% a.a.', normalPart: '' },
        { boldPart: 'Renda variável em revisão —', normalPart: 'volatilidade elevada.' },
        { boldPart: 'Projeção Q4 em processamento...', normalPart: '' }
      ]
    },
    {
      id: 'a4',
      name: 'Agente de Previsão',
      category: 'Forecast e cenários',
      icon: '🕒',
      iconBg: '#FFF9C4',
      status: 'concluído',
      time: 'há 8 min',
      insights: [
        { boldPart: 'Cenário base Q4: crescimento de 6,5%', normalPart: 'na receita.' },
        { boldPart: 'Cenário pessimista contempla queda de 2,1%.', normalPart: '' },
        { boldPart: 'Recomendação: manter reserva de caixa acima de 15%.', normalPart: '' }
      ]
    }
  ];

  constructor(private personaService: PersonaService) {}

  ngOnInit() {
    this.personaService.activePersona$.subscribe((p: PersonaType) => {
      this.personaType = p;
      this.personaLabel = this.personaService.getPersonaLabel();
    });
  }

  goToStep(n: number, agentId?: string) {
    this.currentStep = n;
    if (agentId && MOCK_REPORTS[agentId]) {
      this.selectedReport = MOCK_REPORTS[agentId];
    } else if (n === 1) {
      this.selectedReport = null;
    }
  }
}
