import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="app-shell" *ngIf="authService.getCurrentUser() | async as user; else loginTemplate">
      <app-sidebar #sidebar></app-sidebar>
      <main class="content-area" [style.transition]="'margin-left 0.25s ease'">
        <router-outlet></router-outlet>
      </main>
    </div>

    <ng-template #loginTemplate>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-shell {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }
    .content-area {
      flex: 1;
      height: 100vh;
      overflow-y: auto;
      background: white;
    }
  `]
})
export class AppComponent implements OnInit {
  public authService = inject(AuthService);

  ngOnInit() {
    this.authService.restoreSession();
  }
}
