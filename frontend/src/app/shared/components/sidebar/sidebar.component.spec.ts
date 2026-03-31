import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SidebarComponent } from './sidebar.component';
import { UserGroupsService } from '../../../core/user-groups.service';
import { AuthService } from '../../../core/auth.service';
import { of } from 'rxjs';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let userGroupsService: jasmine.SpyObj<UserGroupsService>;

  beforeEach(async () => {
    const groupsSpy = jasmine.createSpyObj('UserGroupsService', ['getGroups', 'getActiveGroupId', 'isLoading', 'loadGroups', 'setActiveGroup']);
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);

    groupsSpy.getGroups.and.returnValue(of([]));
    groupsSpy.getActiveGroupId.and.returnValue(of(null));
    groupsSpy.isLoading.and.returnValue(of(false));
    authSpy.getCurrentUser.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, SidebarComponent],
      providers: [
        { provide: UserGroupsService, useValue: groupsSpy },
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    userGroupsService = TestBed.inject(UserGroupsService) as jasmine.SpyObj<UserGroupsService>;
    fixture.detectChanges();
  });

  it('estado inicial deve ser expandido', () => {
    expect(component.isExpanded).toBeTrue();
  });

  it('toggle() deve alternar isExpanded e salvar no localStorage', () => {
    spyOn(localStorage, 'setItem');
    component.toggle();
    expect(component.isExpanded).toBeFalse();
    expect(localStorage.setItem).toHaveBeenCalledWith('sidebar_expanded', 'false');
  });

  it('onGroupClick deve chamar setActiveGroup se o grupo não estiver bloqueado', () => {
    const mockGroup = { id: '1', name: 'G1', locked: false } as any;
    component.onGroupClick(mockGroup);
    expect(userGroupsService.setActiveGroup).toHaveBeenCalledWith('1');
  });

  it('onGroupClick não deve chamar setActiveGroup se o grupo estiver bloqueado', () => {
    const mockGroup = { id: '1', name: 'G1', locked: true } as any;
    component.onGroupClick(mockGroup);
    expect(userGroupsService.setActiveGroup).not.toHaveBeenCalled();
  });
});
