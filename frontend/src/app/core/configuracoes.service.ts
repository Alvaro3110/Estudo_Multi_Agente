import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppUser, AgentConfig, SystemPreference } from './models';

const MOCK_USERS: AppUser[] = [
  { id:'u1', nome:'Carlos Alvares', email:'carlos@santander.com.br',
    perfil:'Admin', grupos:['varejo-sp','credito-imob','agro-premium'], lastAccess:'agora' },
  { id:'u2', nome:'Marina Rocha', email:'marina@santander.com.br',
    perfil:'Gestor', grupos:['varejo-sp','credito-imob'], lastAccess:'há 2h' },
  { id:'u3', nome:'João Pereira', email:'joao@santander.com.br',
    perfil:'Analista', grupos:['varejo-sp'], lastAccess:'ontem' },
];

const MOCK_AGENTS: AgentConfig[] = [
  { id:'fin', name:'Agente Financeiro',  description:'Análise de receita, despesas e fluxo de caixa', type:'financeiro', enabled:true  },
  { id:'ven', name:'Agente de Vendas',   description:'Performance comercial e pipeline',               type:'vendas',     enabled:true  },
  { id:'log', name:'Agente de Logística',description:'Remessas, estoque e operações',                 type:'logistica',  enabled:false },
];

const MOCK_PREFS: SystemPreference[] = [
  { key:'alerts',  label:'Notificações de alertas críticos',
    description:'Receber notificação quando agente detectar anomalia', enabled:true  },
  { key:'hitl',    label:'HITL obrigatório em transações acima de R$ 10K',
    description:'Agente pausa e aguarda aprovação humana',             enabled:true  },
  { key:'history', label:'Salvar histórico de análises automaticamente',
    description:'Conversas ficam disponíveis por 90 dias',            enabled:false },
];

@Injectable({ providedIn: 'root' })
export class ConfiguracoesService {
  private users$ = new BehaviorSubject<AppUser[]>(MOCK_USERS);
  private agents$ = new BehaviorSubject<AgentConfig[]>(MOCK_AGENTS);
  private prefs$ = new BehaviorSubject<SystemPreference[]>(MOCK_PREFS);

  getUsers(): Observable<AppUser[]> { return this.users$.asObservable(); }
  getAgentConfigs(): Observable<AgentConfig[]> { return this.agents$.asObservable(); }
  getPreferences(): Observable<SystemPreference[]> { return this.prefs$.asObservable(); }

  toggleAgent(id: string): void {
    const agents = this.agents$.value.map(a => 
      a.id === id ? { ...a, enabled: !a.enabled } : a
    );
    this.agents$.next(agents);
  }

  togglePreference(key: string): void {
    const prefs = this.prefs$.value.map(p => 
      p.key === key ? { ...p, enabled: !p.enabled } : p
    );
    this.prefs$.next(prefs);
  }

  addUser(user: Partial<AppUser>): void {
    // TODO: POST /api/users quando endpoint existir
    const newUser: AppUser = {
      id: 'u' + Date.now(),
      nome: user.nome || 'Novo Usuário',
      email: user.email || '',
      perfil: user.perfil || 'Analista',
      grupos: [],
      lastAccess: 'nunca'
    };
    this.users$.next([...this.users$.value, newUser]);
  }
}
