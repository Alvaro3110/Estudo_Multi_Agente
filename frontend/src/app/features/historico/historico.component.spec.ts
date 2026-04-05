import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoricoComponent } from './historico.component';
import { HistoricoService } from '../../core/historico.service';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('HistoricoComponent', () => {
  let component: HistoricoComponent;
  let fixture: ComponentFixture<HistoricoComponent>;
  let historicoService: jasmine.SpyObj<HistoricoService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('HistoricoService', ['getHistorico', 'search']);
    spy.getHistorico.and.returnValue(of([
      { id: 'h1', query: 'Query Test', departmentName: 'Financeiro', departmentId: 'fin', messages: [] } as any
    ]));
    spy.search.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [FormsModule, RouterTestingModule, HistoricoComponent],
      providers: [
        { provide: HistoricoService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoricoComponent);
    component = fixture.componentInstance;
    historicoService = TestBed.inject(HistoricoService) as jasmine.SpyObj<HistoricoService>;
    fixture.detectChanges();
  });

  it('deve carregar itens do histórico', () => {
    expect(component.items.length).toBe(1);
  });

  it('deve filtrar itens ao pesquisar', () => {
    component.searchTerm = 'test';
    component.onSearch();
    expect(historicoService.search).toHaveBeenCalledWith('test');
  });

  it('deve selecionar item ao clicar', () => {
    const item = component.items[0];
    component.selectItem(item);
    expect(component.selectedItem).toBe(item);
  });
});
