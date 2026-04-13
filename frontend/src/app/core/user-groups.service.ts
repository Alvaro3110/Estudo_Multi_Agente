import { Injectable, signal } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { UserGroup } from './models';

@Injectable({
  providedIn: 'root'
})
export class UserGroupsService {
  private activeGroupId = new BehaviorSubject<string>('varejo-sp');
  private loading = new BehaviorSubject<boolean>(false);

  getGroups(): Observable<UserGroup[]> {
    return of(MOCK_GROUPS);
  }

  getActiveGroupId(): Observable<string> {
    return this.activeGroupId.asObservable();
  }

  setActiveGroup(id: string): void {
    MOCK_GROUPS.forEach(g => g.active = g.id === id);
    this.activeGroupId.next(id);
  }

  isLoading(): Observable<boolean> {
    return this.loading.asObservable();
  }

  loadGroups(): void {
    // Simula carga
    this.loading.next(true);
    setTimeout(() => this.loading.next(false), 500);
  }
}

const MOCK_GROUPS: UserGroup[] = [
  {
    id: 'varejo-sp',
    name: 'Varejo Digital SP',
    iconType: 'smartphone',
    colorVariant: 'red',
    departmentCount: 9,
    alertCount: 3,
    alertSeverity: 'critical',
    locked: false,
    active: true,
  },
  {
    id: 'credito-imob',
    name: 'Crédito Imobiliário',
    iconType: 'home',
    colorVariant: 'blue',
    departmentCount: 6,
    alertCount: 1,
    alertSeverity: 'warning',
    locked: false,
    active: false,
  },
  {
    id: 'agro-premium',
    name: 'Agro Premium',
    iconType: 'leaf',
    colorVariant: 'green',
    departmentCount: 4,
    alertCount: 0,
    alertSeverity: 'none',
    locked: true,
    active: false,
  },
  {
    id: 'corporate',
    name: 'Corporate Banking',
    iconType: 'users',
    colorVariant: 'purple',
    departmentCount: 12,
    alertCount: 0,
    alertSeverity: 'none',
    locked: true,
    active: false,
  },
  {
    id: 'pme-sul',
    name: 'PME Sul',
    iconType: 'dollar',
    colorVariant: 'amber',
    departmentCount: 7,
    alertCount: 0,
    alertSeverity: 'none',
    locked: true,
    active: false,
  },
  {
    id: 'wealth',
    name: 'Wealth Management',
    iconType: 'pie-chart',
    colorVariant: 'teal',
    departmentCount: 5,
    alertCount: 0,
    alertSeverity: 'none',
    locked: true,
    active: false,
  },
  {
    id: 'seguros',
    name: 'Seguros & Previdência',
    iconType: 'shield',
    colorVariant: 'indigo',
    departmentCount: 8,
    alertCount: 0,
    alertSeverity: 'none',
    locked: true,
    active: false,
  },
  {
    id: 'bacen-reg',
    name: 'Bacen & Regulatório',
    iconType: 'landmark',
    colorVariant: 'pink',
    departmentCount: 3,
    alertCount: 0,
    alertSeverity: 'none',
    locked: true,
    active: false,
  },
];
