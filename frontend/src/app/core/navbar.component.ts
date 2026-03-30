import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-brand">AgentOS 🤖</div>
      <div class="nav-links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Chat Principal</a>
        <a routerLink="/painel" routerLinkActive="active">Painel de Agentes</a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: #1a1a1a;
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .nav-brand {
      font-size: 1.5rem;
      font-weight: bold;
    }
    .nav-links {
      display: flex;
      gap: 2rem;
      a {
        color: #ccc;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s;
        &.active {
          color: #fff;
          border-bottom: 2px solid #007bff;
          padding-bottom: 0.25rem;
        }
        &:hover { color: #fff; }
      }
    }
  `]
})
export class NavbarComponent {}
