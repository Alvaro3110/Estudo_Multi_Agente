import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DeptKpi, AlertItem, AgentStatus, ExecKpi } from './models';

@Injectable({ providedIn: 'root' })
export class DashboardExecService {
  
  getExecKpis(): Observable<ExecKpi[]> {
    return of([
      { label:'Eficiência global',  value:'97,4%', trend:'↑ 1,2pp vs mês',  trendType:'up',     accent:true },
      { label:'Agentes ativos',     value:'4',     trend:'2 departamentos',  trendType:'neutral' },
      { label:'Relatórios hoje',    value:'38',    trend:'↑ 14% vs ontem',   trendType:'up'      },
      { label:'Alertas abertos',    value:'3',     trend:'↑ 1 novo hoje',    trendType:'down'    },
    ]);
  }

  getDeptKpis(): Observable<DeptKpi[]> {
    return of([
      { id:'tec', name:'Tecnologia & Inovação', efficiency:99, efficiencyDelta:2,  color:'#1565C0' },
      { id:'fin', name:'Departamento Financeiro', efficiency:98, efficiencyDelta:1, color:'#EC0000' },
      { id:'rh',  name:'Recursos Humanos',        efficiency:97, efficiencyDelta:0, color:'#43A047' },
      { id:'log', name:'Operações e Logística',   efficiency:95, efficiencyDelta:-1,color:'#F57F17' },
    ]);
  }

  getAlerts(): Observable<AlertItem[]> {
    return of([
      { id:'a1', severity:'high',   message:'Delta Exportações — queda 21% em Câmbio',     time:'há 2 min',  department:'Financeiro' },
      { id:'a2', severity:'medium', message:'2 contratos próximos do vencimento',           time:'há 18 min', department:'Financeiro' },
      { id:'a3', severity:'low',    message:'XPTO Incorporações — novo pipeline Q4',        time:'há 1h',     department:'Financeiro' },
    ]);
  }

  getAgentStatuses(): Observable<AgentStatus[]> {
    return of([
      { id:'fin', name:'Ag. Financeiro',   type:'financeiro',   status:'running', currentTask:'Analisando fluxo de caixa...' },
      { id:'fra', name:'Ag. Antifraude',   type:'atendimento',  status:'waiting', currentTask:'HITL — TED R$ 42K'            },
      { id:'ate', name:'Ag. Atendimento',  type:'atendimento',  status:'running', currentTask:'Ticket #3391'                 },
      { id:'inv', name:'Ag. Investimentos',type:'investimentos', status:'idle',    currentTask:'Último: 09:14'               },
    ]);
  }
}
