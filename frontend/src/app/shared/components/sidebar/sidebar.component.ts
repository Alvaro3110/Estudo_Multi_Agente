import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserGroupsService } from '../../../core/user-groups.service';
import { AuthService } from '../../../core/auth.service';
import { DeptIconComponent } from '../dept-icon/dept-icon.component';
import { UserGroup } from '../../../core/models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, DeptIconComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private userGroupsService = inject(UserGroupsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isExpanded = true;
  
  groups$ = this.userGroupsService.getGroups();
  user$ = this.authService.getCurrentUser();

  ngOnInit() {
    const saved = localStorage.getItem('sidebar_expanded');
    this.isExpanded = saved !== null ? saved === 'true' : true;
    this.userGroupsService.loadGroups();
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
    localStorage.setItem('sidebar_expanded', String(this.isExpanded));
  }

  onGroupClick(group: UserGroup): void {
    if (group.locked) return;
    this.userGroupsService.setActiveGroup(group.id);
    this.router.navigate(['/']);
  }

  logout() {
    this.authService.logout();
    window.location.reload();
  }
}
