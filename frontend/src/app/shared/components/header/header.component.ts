import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonaService } from '../../../core/persona.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="san-header">
      <div class="header-left">
        <div class="logo-group">
          <svg class="san-logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="#EC0000"/>
            <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6Z" fill="#EC0000"/>
          </svg>
          <span class="san-text">Santander</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="user-pill">
          <div class="avatar">
            <span class="icon">👤</span>
          </div>
          <span class="greeting">Olá, <strong>Carlos</strong> | {{ personaLabel }}</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .san-header {
      height: 64px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: white;
      border-bottom: 0.5px solid #E0E0E0;
    }

    .logo-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .san-logo-icon {
      width: 28px;
      height: 28px;
    }

    .san-text {
      font-size: 22px;
      font-weight: 700;
      color: #EC0000;
      letter-spacing: -0.5px;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 12px;
      border-radius: 24px;
      background: #F9F9F9;
      border: 0.5px solid #E0E0E0;
    }

    .avatar {
      width: 32px;
      height: 32px;
      background: #EEE;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .greeting {
      font-size: 13px;
      color: #666;
      strong { color: #333; }
    }
  `]
})
export class HeaderComponent implements OnInit {
  personaLabel: string = '';

  constructor(private personaService: PersonaService) {}

  ngOnInit() {
    this.personaService.activePersona$.subscribe(() => {
      this.personaLabel = this.personaService.getPersonaLabel();
    });
  }
}
