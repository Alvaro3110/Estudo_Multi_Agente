import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface que representa um passo individual do agente.
 */
export interface AgentStep {
  type: 'thinking' | 'action' | 'agent_report' |
        'checkpoint' | 'stream' | 'complete' | 'error';
  agent_id?: string;
  session_id?: string;
  content: string;
  metadata?: Record<string, any>;
  pipeline_state?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = 'http://localhost:4000';
  public currentSessionId: string | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Inicia a execução do agente consumindo dados via SSE.
   */
  runAgent(payload: {
    message: string;
    department_id: string;
    group_context: string;
    model_name?: string;
  }): Observable<AgentStep> {
    return new Observable((observer) => {
      fetch(`${this.apiUrl}/api/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          model_name: payload.model_name ?? 'GPT-4o Mini (OpenAI)'
        }),
      }).then(async (response) => {
        // Captura session_id do header para HITL futuro
        const sessionId = response.headers.get('X-Session-Id');
        if (sessionId) this.currentSessionId = sessionId;

        if (!response.body) {
          throw new Error('ReadableStream not supported by the browser.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Lida com múltiplos pacotes 'data:' juntos no mesmo chunk de buffering da rede
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            
            const raw = line.replace('data: ', '').trim();
            if (raw === '[DONE]') { 
              observer.complete(); 
              return; 
            }
            try {
              const step: AgentStep = JSON.parse(raw);
              observer.next(step);
            } catch (err) { 
              // Ignora linhas mal formatadas ou incompletas silenciosamente
            }
          }
        }
        observer.complete();
      }).catch((err) => observer.error(err));
    });
  }

  /**
   * Retoma a execução do agente após aprovação/rejeição humana via HTTP POST assíncrono.
   */
  resumeAgent(sessionId: string, approved: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/agent/resume`, {
      session_id: sessionId,
      approved
    });
  }
}
