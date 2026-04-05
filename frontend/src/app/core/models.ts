// ---- Dashboard ----
export interface DepartmentIndicator {
  label: string;
  value: string;
  status: 'green' | 'yellow' | 'red';
}

export interface DepartmentMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface Department {
  id: string;
  name: string;
  iconType: string;
  efficiency: number;
  status: 'ready' | 'processing' | 'error';
  summary: string;
  metrics: DepartmentMetric[];
  indicators: DepartmentIndicator[];
}

export interface DeptAgent {
  id: string;
  name: string;                    // ex: "Agente de Fluxo de Caixa"
  color: string;                   // hex da cor do avatar
  iconType: string;                // tipo do ícone SVG
  pillVariant: 'red' | 'blue' | 'green' | 'amber' | 'purple';
  report: string;                  // texto narrativo do relatório (mock)
  rowCount: number;                // registros analisados (mock)
  status: 'done' | 'running';
}

export interface DeptReportConfig {
  deptId: string;
  deptName: string;
  iconType: string;
  iconColor: string;               // hex ex: '#EC0000'
  iconBg: string;                  // hex ex: '#FEF0F0'
  badgeText: string;               // ex: '1 alerta crítico'
  badgeVariant: 'ok' | 'warn' | 'error';
  kpis: DepartmentMetric[];        // exatamente 3
  agents: DeptAgent[];             // 3 agentes especializados
  indicators: DepartmentIndicator[]; // 4 indicadores do farol
  summaryAfterReport: string;      // texto conclusivo pós-relatório
}

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
