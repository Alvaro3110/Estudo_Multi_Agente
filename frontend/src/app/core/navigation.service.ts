import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppView = 'dashboard' | 'chat';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private currentView = new BehaviorSubject<AppView>('dashboard');
  currentView$ = this.currentView.asObservable();

  setView(view: AppView) {
    console.log('[NavigationService] Trocando visualização para:', view);
    this.currentView.next(view);
  }
}
