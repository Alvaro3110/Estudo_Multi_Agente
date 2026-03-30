import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityEvent } from '../../../core/agents-dashboard.service';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feed-container">
      <h3>atividade recente</h3>
      
      <div class="events-list">
        <div class="event-item" *ngFor="let event of activities">
          <div class="dot" [ngClass]="event.type"></div>
          <div class="message">{{ event.message }}</div>
          <div class="time">{{ event.time }}</div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./activity-feed.component.scss']
})
export class ActivityFeedComponent {
  @Input() activities: ActivityEvent[] = [];
}
