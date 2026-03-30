import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderComponent } from '../../shared/header/header.component';
import { StepperComponent } from '../../shared/stepper/stepper.component';
import { ContextBarComponent } from '../../shared/context-bar/context-bar.component';
import { ActionCardComponent } from './action-card.component';
import { DashboardService, ActionItem, Department } from '../../core/dashboard.service';
import { combineLatest, map, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-action',
  standalone: true,
  imports: [CommonModule, HeaderComponent, StepperComponent, ContextBarComponent, ActionCardComponent],
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.scss']
})
export class ActionComponent implements OnInit {
  deptId$ = this.route.params.pipe(map(p => p['id']));
  dept$ = this.deptId$.pipe(switchMap(id => this.dashboardService.getDepartments().pipe(
    map(depts => depts.find(d => d.id === id))
  )));

  actionItemsWithDecisions$ = combineLatest([
    this.deptId$.pipe(switchMap(id => this.dashboardService.getActionItems(id))),
    this.dashboardService.getDecisions()
  ]).pipe(
    map(([items, decisions]) => {
      return items.map(item => ({
        ...item,
        decision: decisions[item.id]
      }));
    })
  );

  summary$ = this.actionItemsWithDecisions$.pipe(
    map(items => {
      const high = items.filter(i => i.priority === 'high').length;
      const medium = items.filter(i => i.priority === 'medium').length;
      const low = items.filter(i => i.priority === 'low').length;
      const approved = items.filter(i => i.decision === 'approve').length;
      const delegated = items.filter(i => i.decision === 'delegate').length;
      const dismissed = items.filter(i => i.decision === 'dismiss').length;
      const total = items.length;
      const decided = approved + delegated + dismissed;
      
      return { high, medium, low, approved, delegated, dismissed, total, pending: total - decided };
    })
  );

  showToast = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {}

  onDecided(event: {id: string, decision: 'approve' | 'delegate' | 'dismiss'}) {
    this.dashboardService.setDecision(event.id, event.decision);
  }

  concluir() {
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
      this.dashboardService.resetDecisions();
      this.router.navigate(['/']);
    }, 3000);
  }
}
