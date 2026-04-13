import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { UserGroupsService } from '../../../core/user-groups.service';
import { AuthService } from '../../../core/auth.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { DeptIconComponent } from '../dept-icon/dept-icon.component';
import { UserGroup } from '../../../core/models';

describe('SidebarComponent — Meus Grupos enriquecidos', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockUserGroupsService: any;
  let mockAuthService: any;

  const mGroups: UserGroup[] = [
    { id: '1', name: 'G1', iconType: 'smartphone', colorVariant: 'red', departmentCount: 1, alertCount: 2, alertSeverity: 'critical', locked: false, active: true },
    { id: '2', name: 'G2', iconType: 'home', colorVariant: 'blue', departmentCount: 2, alertCount: 1, alertSeverity: 'warning', locked: false, active: false },
    { id: '3', name: 'G3', iconType: 'leaf', colorVariant: 'green', departmentCount: 3, alertCount: 0, alertSeverity: 'none', locked: true, active: false },
  ];

  beforeEach(async () => {
    mockUserGroupsService = {
      getGroups: () => of(mGroups),
      loadGroups: jasmine.createSpy('loadGroups'),
      setActiveGroup: jasmine.createSpy('setActiveGroup')
    };
    mockAuthService = {
      getCurrentUser: () => of({ nome: 'Test', perfil: 'Admin' })
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, RouterTestingModule, DeptIconComponent],
      providers: [
        { provide: UserGroupsService, useValue: mockUserGroupsService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve renderizar os grupos fornecidos', () => {
    const items = fixture.nativeElement.querySelectorAll('.grupo-item');
    expect(items.length).toBe(3);
  });

  it('grupo com alertSeverity=critical deve ter badge vermelho', () => {
    const alert = fixture.nativeElement.querySelector('.ga-critical');
    expect(alert).toBeTruthy();
    expect(alert.textContent.trim()).toBe('2');
  });

  it('grupo com alertSeverity=warning deve ter badge âmbar', () => {
    const alert = fixture.nativeElement.querySelector('.ga-warning');
    expect(alert).toBeTruthy();
    expect(alert.textContent.trim()).toBe('1');
  });

  it('grupo locked deve ter ícone de cadeado e classe locked', () => {
    const lockedItem = fixture.nativeElement.querySelectorAll('.grupo-item')[2];
    expect(lockedItem.classList.contains('grupo-locked')).toBe(true);
    expect(lockedItem.querySelector('.g-lock')).toBeTruthy();
  });

  it('cada grupo tem classe gc-{colorVariant} no ícone', () => {
    const ico = fixture.nativeElement.querySelector('.g-ico');
    expect(ico.classList.contains('gc-red')).toBe(true);
  });
});
