import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'agent';
  content: string;
  type?: 'thinking' | 'action' | 'checkpoint' | 'complete';
  sessionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  private isTypingSubject = new BehaviorSubject<boolean>(false);
  isTyping$ = this.isTypingSubject.asObservable();

  constructor() {}

  async sendMessage(text: string) {
    const userMsg: ChatMessage = { role: 'user', content: text };
    this.addMessage(userMsg);
    this.isTypingSubject.next(true);

    console.log('[ChatService] Enviando mensagem para o backend:', text);

    try {
      const response = await fetch('http://localhost:8000/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      console.log('[ChatService] Resposta inicial recebida:', response.status);

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let currentAgentMsg: ChatMessage | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('[ChatService] Stream finalizado.');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.substring(6));
            console.log('[ChatService] SSE Data:', data);
            
            // Se for novo ou tipo diferente, atualizamos a bolha ou criamos nova
            if (!currentAgentMsg || data.type !== 'thinking') {
               currentAgentMsg = { 
                 role: 'agent', 
                 content: data.content, 
                 type: data.type,
                 sessionId: data.session_id 
               };
               this.addMessage(currentAgentMsg);
            } else {
               // Atualiza o conteúdo da mesma bolha se for só progresso de texto
               this.updateLastAgentMessage(data.content, data.type);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      this.addMessage({ role: 'agent', content: 'Ops, ocorreu um erro ao conectar com o servidor.' });
    } finally {
      this.isTypingSubject.next(false);
    }
  }

  private addMessage(msg: ChatMessage) {
    const current = this.messagesSubject.value;
    this.messagesSubject.next([...current, msg]);
  }

  private updateLastAgentMessage(content: string, type: string) {
    const current = [...this.messagesSubject.value];
    for (let i = current.length - 1; i >= 0; i--) {
      if (current[i].role === 'agent') {
        current[i].content = content;
        current[i].type = type as any;
        break;
      }
    }
    this.messagesSubject.next(current);
  }

  clearChat() {
    this.messagesSubject.next([]);
  }
}
