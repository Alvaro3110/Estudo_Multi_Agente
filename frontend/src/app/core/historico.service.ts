import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HistoricoItem } from './models';

const MOCK_DATA: HistoricoItem[] = [
  { id:'h1', departmentId:'fin', departmentName:'Financeiro', departmentColor:'#EC0000',
    query:'Análise de receita por produto outubro 2025',
    agentCount:4, rowCount:1482, createdAt:'2026-03-30T09:38:00',
    messages:[
      { role:'user', content:'Faça um relatório completo de receita por produto de outubro', timestamp:'09:38' },
      { role:'agent', agentName:'Agente Principal', content:'Certo, iniciando análise do Departamento Financeiro com 4 agentes especializados.', timestamp:'09:38' },
      { role:'agent', agentName:'Agente de Fluxo de Caixa', status:'done',
        content:'O produto Crédito Consignado representa a maior fatia com R$ 1,82M. Crédito Imobiliário avançou +18% impulsionado por XPTO Incorporações. Delta Exportações recuou 21% em Câmbio.',
        timestamp:'09:41', rowCount:1482 }
    ]
  },
  { id:'h2', departmentId:'log', departmentName:'Logística', departmentColor:'#F57F17',
    query:'Remessas com atraso no Varejo Digital SP',
    agentCount:2, rowCount:891, createdAt:'2026-03-30T08:21:00', messages:[] },
  { id:'h3', departmentId:'rh', departmentName:'RH', departmentColor:'#43A047',
    query:'Turnover por região no Q3',
    agentCount:3, rowCount:2104, createdAt:'2026-03-29T16:44:00', messages:[] },
  { id:'h4', departmentId:'tec', departmentName:'Tecnologia', departmentColor:'#1565C0',
    query:'Relatório completo sobre o que preciso saber sobre a empresa',
    agentCount:4, rowCount:3891, createdAt:'2026-03-29T14:12:00', messages:[] },
  { id:'h5', departmentId:'fin', departmentName:'Financeiro', departmentColor:'#EC0000',
    query:'Inadimplência por segmento — setembro',
    agentCount:2, rowCount:644, createdAt:'2026-03-28T11:30:00', messages:[] },
];

@Injectable({ providedIn: 'root' })
export class HistoricoService {
  private items$ = new BehaviorSubject<HistoricoItem[]>(MOCK_DATA);

  getHistorico(): Observable<HistoricoItem[]> {
    return this.items$.asObservable();
  }

  getById(id: string): Observable<HistoricoItem | undefined> {
    return this.items$.pipe(
      map(items => items.find(i => i.id === id))
    );
  }

  search(query: string): Observable<HistoricoItem[]> {
    const q = query.toLowerCase();
    return this.items$.pipe(
      map(items => items.filter(i => 
        i.query.toLowerCase().includes(q) || 
        i.departmentName.toLowerCase().includes(q)
      ))
    );
  }
}
