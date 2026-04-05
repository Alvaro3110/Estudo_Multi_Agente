import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfiguracoesComponent } from './configuracoes.component';
import { ConfiguracoesService } from '../../core/configuracoes.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('ConfiguracoesComponent', () => {
  let component: ConfiguracoesComponent;
  let fixture: ComponentFixture<ConfiguracoesComponent>;
  let configService: jasmine.SpyObj<ConfiguracoesService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ConfiguracoesService', ['getUsers', 'getAgentConfigs', 'getPreferences', 'toggleAgent', 'togglePreference', 'addUser']);
    spy.getUsers.and.returnValue(of([]));
    spy.getAgentConfigs.and.returnValue(of([{ id: 'a1', enabled: true } as any]));
    spy.getPreferences.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [FormsModule, ConfiguracoesComponent],
      providers: [
        { provide: ConfiguracoesService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguracoesComponent);
    component = fixture.componentInstance;
    configService = TestBed.inject(ConfiguracoesService) as jasmine.SpyObj<ConfiguracoesService>;
    fixture.detectChanges();
  });

  it('seção Usuários deve estar ativa por padrão', () => {
    expect(component.activeSection).toBe('usuarios');
  });

  it('deve abrir modal ao clicar em Adicionar', () => {
    component.openAddModal();
    expect(component.showAddModal).toBeTrue();
  });

  it('deve chamar toggleAgent do service', () => {
    component.toggleAgent('a1');
    expect(configService.toggleAgent).toHaveBeenCalledWith('a1');
  });
});
