import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { map, catchError, finalize, tap } from 'rxjs/operators';

export interface UserGroup {
  id: string;
  name: string;
  iconType: 'phone' | 'home' | 'leaf' | 'chart' | 'shield';
  color: 'red' | 'blue' | 'green' | 'amber' | 'purple';
  locked: boolean;   // true = usuário tem acesso somente leitura
  active: boolean;   // true = grupo atualmente selecionado
}

@Injectable({ providedIn: 'root' })
export class UserGroupsService {
  private http = inject(HttpClient);
  
  private groups$ = new BehaviorSubject<UserGroup[]>([]);
  private activeGroupId$ = new BehaviorSubject<string | null>(null);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);

  /**
   * Carrega os grupos aos quais o usuário logado tem acesso.
   * GET /api/users/me/groups → Retorna UserGroup[].
   * Fallback para mock enquanto o endpoint não estiver disponível.
   */
  loadGroups(): void {
    this.loading$.next(true);
    // Simulação de chamada real.
    this.http.get<UserGroup[]>('http://localhost:4000/api/users/me/groups').pipe(
      catchError(() => {
        // TODO: remover mock quando endpoint real existir no backend FastAPI
        return of(this.getMockGroups());
      }),
      finalize(() => this.loading$.next(false))
    ).subscribe(groups => {
      this.groups$.next(groups);
      // Ativa o primeiro grupo por padrão, caso nenhum esteja ativo
      if (groups.length > 0 && !this.activeGroupId$.value) {
        this.activeGroupId$.next(groups[0].id);
      }
    });
  }

  /**
   * Mock local para desenvolvimento.
   */
  private getMockGroups(): UserGroup[] {
    return [
      { 
        id: 'varejo-sp', name: 'Varejo Digital SP', 
        iconType: 'phone', color: 'red', locked: false, active: true 
      },
      { 
        id: 'credito-imob', name: 'Crédito Imobiliário', 
        iconType: 'home', color: 'blue', locked: true, active: false 
      },
      { 
        id: 'agro-premium', name: 'Agro Premium', 
        iconType: 'leaf', color: 'green', locked: true, active: false 
      },
    ];
  }

  getGroups(): Observable<UserGroup[]> { 
    return this.groups$.asObservable(); 
  }

  getActiveGroupId(): Observable<string | null> { 
    return this.activeGroupId$.asObservable(); 
  }

  getActiveGroup(): Observable<UserGroup | undefined> {
    return combineLatest([this.groups$, this.activeGroupId$]).pipe(
      map(([groups, id]) => groups.find(g => g.id === id))
    );
  }

  isLoading(): Observable<boolean> { 
    return this.loading$.asObservable(); 
  }

  setActiveGroup(id: string): void { 
    this.activeGroupId$.next(id); 
  }
}
