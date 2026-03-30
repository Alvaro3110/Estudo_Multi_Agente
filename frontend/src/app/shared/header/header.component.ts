import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="san-header">
      <div class="logo-container">
        <svg class="chama" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L19 11H28L21 17L24 26L16 20L8 26L11 17L4 11H13L16 2Z" fill="#EC0000"/>
        </svg>
        <span class="logo-text">Santander</span>
      </div>
      <div class="user-profile">
        <span class="user-info">Olá, Carlos | <strong>Gestor</strong></span>
        <div class="avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {}
