// ---- Dashboard ----
export interface DeptKpi {
  id: string;
  name: string;
  efficiency: number;        // 0-100
  efficiencyDelta: number;   // pp vs mês anterior
  color: string;             // hex
}

export interface AgentStatus {
  id: string;
  name: string;
  type: 'financeiro' | 'vendas' | 'logistica' | 'atendimento' | 'investimentos';
  status: 'running' | 'waiting' | 'idle' | 'error';
  currentTask: string;
  lastRun?: string;
}

export interface AlertItem {
  id: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  time: string;
  department: string;
}

export interface ExecKpi {
  label: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  accent?: boolean;
}

// ---- Histórico ----
export interface HistoricoItem {
  id: string;
  departmentId: string;
  departmentName: string;
  departmentColor: string;
  query: string;
  agentCount: number;
  rowCount: number;
  createdAt: string;        // ISO string
  messages: HistoricoMessage[];
}

export interface HistoricoMessage {
  role: 'user' | 'agent';
  agentName?: string;
  content: string;
  timestamp: string;
  rowCount?: number;
  status?: 'done' | 'running' | 'error';
}

// ---- Configurações ----
export interface AppUser {
  id: string;
  nome: string;
  email: string;
  perfil: 'Admin' | 'Gestor' | 'Analista';
  grupos: string[];
  lastAccess: string;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  type: 'financeiro' | 'vendas' | 'logistica';
  enabled: boolean;
}

export interface SystemPreference {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}
