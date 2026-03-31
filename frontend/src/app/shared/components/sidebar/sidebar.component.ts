import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserGroupsService, UserGroup } from '../../../core/user-groups.service';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private userGroupsService = inject(UserGroupsService);
  private authService = inject(AuthService);

  // Estado do sidebar salvo no localStorage para persistir entre sessões
  isExpanded = true;
  
  groups$ = this.userGroupsService.getGroups();
  activeGroupId$ = this.userGroupsService.getActiveGroupId();
  user$ = this.authService.getCurrentUser();
  isLoadingGroups$ = this.userGroupsService.isLoading();

  ngOnInit() {
    // Restaurar estado do sidebar
    const saved = localStorage.getItem('sidebar_expanded');
    this.isExpanded = saved !== null ? saved === 'true' : true;

    // Carregar grupos
    this.userGroupsService.loadGroups();
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
    localStorage.setItem('sidebar_expanded', String(this.isExpanded));
  }

  onGroupClick(group: UserGroup) {
    if (!group.locked) {
      this.userGroupsService.setActiveGroup(group.id);
    }
  }

  logout() {
    this.authService.logout();
    window.location.reload(); // Simples recarregamento para limpar estados
  }

  getGroupIconClass(color: string): string {
    return 'gi-' + color;
  }
}
