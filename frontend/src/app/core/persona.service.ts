import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type PersonaType = 'mesa' | 'gestor';

export interface GroupItem {
  id: string;
  name: string;
  icon: string;
  restricted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private activePersona = new BehaviorSubject<PersonaType>('gestor');
  activePersona$ = this.activePersona.asObservable();

  private groups: Record<PersonaType, GroupItem[]> = {
    mesa: [
      { id: 'g1', name: 'Visão Global 360', icon: '🌍', restricted: false },
      { id: 'g2', name: 'Mercado & Selic', icon: '📊', restricted: false },
      { id: 'g3', name: 'Benchmarking Peers', icon: '🏦', restricted: false },
      { id: 'g4', name: 'Pricing Engine v2', icon: '⚡', restricted: false }
    ],
    gestor: [
      { id: 'g5', name: 'Varejo Digital SP', icon: '📱', restricted: true },
      { id: 'g6', name: 'Crédito Imobiliário', icon: '🏠', restricted: true },
      { id: 'g7', name: 'Agro Premium', icon: '🚜', restricted: true }
    ]
  };

  constructor() {}

  setPersona(type: PersonaType) {
    console.log('[PersonaService] Trocando persona para:', type);
    this.activePersona.next(type);
  }

  getGroupsForActivePersona() {
    return this.groups[this.activePersona.value];
  }

  getPersonaLabel(): string {
    return this.activePersona.value === 'mesa' ? 'Mesa de Precificação' : 'Gestor de Carteira';
  }
}
