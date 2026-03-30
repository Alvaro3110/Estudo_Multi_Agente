import { Component, OnInit, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../core/chat.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <div class="chat-container">
      <app-header></app-header>
      
      <div class="chat-messages" #scrollContainer>
        <div class="welcome-banner" *ngIf="messages.length === 0">
           <div class="ai-logo">🔴</div>
           <h2>Como posso ajudar você hoje, Carlos?</h2>
           <p>Estou pronto para analisar carteiras, verificar riscos ou responder dúvidas sobre o mercado.</p>
        </div>

        <div *ngFor="let msg of messages" class="message-wrapper" [class.user]="msg.role === 'user'">
          <div class="avatar" *ngIf="msg.role === 'agent'">🤖</div>
          <div class="bubble" [ngClass]="msg.type || ''">
            <div class="type-indicator" *ngIf="msg.type && msg.role === 'agent'">
               [{{ msg.type.toUpperCase() }}]
            </div>
            <p>{{ msg.content }}</p>
          </div>
        </div>

        <div class="typing-indicator" *ngIf="isTyping">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div class="input-area">
        <div class="input-wrapper">
          <input 
            type="text" 
            [(ngModel)]="userInput" 
            (keyup.enter)="send()" 
            placeholder="Digite sua dúvida aqui..."
            [disabled]="isTyping"
          />
          <button (click)="send()" [disabled]="!userInput || isTyping">
            <span class="icon">🚀</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: white;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
    }

    .welcome-banner {
      text-align: center;
      margin-top: 100px;
      .ai-logo { font-size: 40px; margin-bottom: 20px; }
      h2 { font-size: 24px; color: #333; margin-bottom: 12px; }
      p { color: #999; font-size: 15px; }
    }

    .message-wrapper {
      display: flex;
      gap: 12px;
      max-width: 80%;
      
      &.user {
        align-self: flex-end;
        flex-direction: row-reverse;
      }
    }

    .avatar {
      width: 32px;
      height: 32px;
      background: #F5F5F5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .bubble {
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      
      p { margin: 0; }
      
      .message-wrapper.user & {
        background: #EC0000;
        color: white;
        border-bottom-right-radius: 2px;
      }
      
      .message-wrapper:not(.user) & {
        background: #F5F5F5;
        color: #333;
        border-bottom-left-radius: 2px;
      }

      &.thinking { opacity: 0.7; font-style: italic; }
      &.action { border-left: 3px solid #FB8C00; }
    }

    .type-indicator {
      font-size: 9px;
      font-weight: 700;
      color: #999;
      margin-bottom: 4px;
    }

    .typing-indicator {
      display: flex;
      gap: 4px;
      padding: 12px;
      span {
        width: 6px;
        height: 6px;
        background: #CCC;
        border-radius: 50%;
        animation: pulse 1s infinite alternate;
        &:nth-child(2) { animation-delay: 0.2s; }
        &:nth-child(3) { animation-delay: 0.4s; }
      }
    }

    @keyframes pulse { to { opacity: 0.3; transform: scale(0.8); } }

    .input-area {
      padding: 24px 40px;
      border-top: 0.5px solid #E0E0E0;
    }

    .input-wrapper {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      gap: 12px;
      background: #F9F9F9;
      border: 1px solid #E0E0E0;
      padding: 8px 16px;
      border-radius: 12px;
      
      input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-size: 14px;
        color: #333;
      }
      
      button {
        background: white;
        border: 1px solid #E0E0E0;
        width: 36px;
        height: 36px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        &:disabled { opacity: 0.5; cursor: not-allowed; }
        &:hover:not(:disabled) { background: #EEE; }
      }
    }
  `]
})
export class AiChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  
  messages: ChatMessage[] = [];
  isTyping = false;
  userInput = '';

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.messages$.subscribe(msgs => this.messages = msgs);
    this.chatService.isTyping$.subscribe(typing => this.isTyping = typing);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  send() {
    if (!this.userInput.trim()) return;
    const msg = this.userInput;
    this.userInput = '';
    this.chatService.sendMessage(msg);
  }

  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch(err) {}
  }
}
