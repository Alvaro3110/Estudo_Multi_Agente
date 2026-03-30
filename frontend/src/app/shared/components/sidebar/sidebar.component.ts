import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PersonaService, PersonaType, GroupItem } from '../../../core/persona.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="persona-section">
        <label>ACESSO ATUAL</label>
        <div class="persona-badge" [class.mesa]="activePersona === 'mesa'" title="Perfil: {{ personaLabel }}">
          {{ personaLabel }}
        </div>
      </div>

      <nav class="group-nav">
        <div class="section-label">NAVEGAÇÃO</div>
        <ul class="tool-list">
          <li class="tool-item" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </span> 
            Dashboard
          </li>
          <li class="tool-item" routerLink="/chat" routerLinkActive="active">
            <span class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </span> 
            Perguntar para IA
          </li>
        </ul>

        <div class="divider"></div>

        <div class="section-label">MEUS GRUPOS</div>
        <ul class="group-list">
          <li *ngFor="let group of groups" class="group-item" [attr.title]="group.name">
            <div class="group-icon-box" [ngClass]="getGroupClass(group.name)">
               <svg *ngIf="group.name.includes('Varejo')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
               <svg *ngIf="group.name.includes('Imobiliário')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
               <svg *ngIf="group.name.includes('Agro')" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
            </div>
            <span class="name">{{ group.name }}</span>
            <span class="lock" *ngIf="group.restricted">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
          <div class="persona-switcher" (click)="togglePersona()">
            Trocar para {{ activePersona === 'gestor' ? 'Mesa' : 'Gestor' }}
          </div>
      </div>
    </aside>
  `,
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  activePersona: PersonaType = 'gestor';
  personaLabel: string = '';
  groups: GroupItem[] = [];

  constructor(private personaService: PersonaService) {}

  ngOnInit() {
    this.personaService.activePersona$.subscribe((p: PersonaType) => {
      this.activePersona = p;
      this.personaLabel = this.personaService.getPersonaLabel();
      this.groups = this.personaService.getGroupsForActivePersona();
    });
  }

  getGroupClass(name: string): string {
    if (name.includes('Varejo')) return 'varejo';
    if (name.includes('Imobiliário')) return 'imobiliario';
    if (name.includes('Agro')) return 'agro';
    return '';
  }

  togglePersona() {
    this.personaService.setPersona(this.activePersona === 'gestor' ? 'mesa' : 'gestor');
  }
}
