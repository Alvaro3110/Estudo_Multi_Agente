import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracoesService } from '../../core/configuracoes.service';
import { AppUser, AgentConfig, SystemPreference } from '../../core/models';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent implements OnInit {
  private configService = inject(ConfiguracoesService);

  activeSection: string = 'usuarios';
  users: AppUser[] = [];
  agents: AgentConfig[] = [];
  prefs: SystemPreference[] = [];

  // Modal de adição de usuário
  showAddModal = false;
  newUser: Partial<AppUser> = { nome: '', email: '', perfil: 'Analista' };

  ngOnInit() {
    this.configService.getUsers().subscribe(data => this.users = data);
    this.configService.getAgentConfigs().subscribe(data => this.agents = data);
    this.configService.getPreferences().subscribe(data => this.prefs = data);
  }

  setSection(id: string) {
    this.activeSection = id;
  }

  toggleAgent(id: string) {
    this.configService.toggleAgent(id);
  }

  togglePreference(key: string) {
    this.configService.togglePreference(key);
  }

  openAddModal() {
    this.showAddModal = true;
    this.newUser = { nome: '', email: '', perfil: 'Analista' };
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  saveUser() {
    if (this.newUser.nome && this.newUser.email) {
      this.configService.addUser(this.newUser);
      this.closeAddModal();
    }
  }

  editUser(user: AppUser) {
    alert("Edição em desenvolvimento para o usuário: " + user.nome);
  }

  getAvatarColor(perfil: string): string {
    const colors: any = {
      'Admin': '#EC0000',
      'Gestor': '#1565C0',
      'Analista': '#2E7D32'
    };
    return colors[perfil] || '#888';
  }

  getInitials(nome: string): string {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
