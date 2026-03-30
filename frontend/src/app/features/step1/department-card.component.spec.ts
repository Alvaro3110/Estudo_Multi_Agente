import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DepartmentCardComponent } from './department-select.component'; // No mesmo arquivo
import { By } from '@angular/platform-browser';

describe('DepartmentCardComponent', () => {
  let component: DepartmentCardComponent;
  let fixture: ComponentFixture<DepartmentCardComponent>;

  const mockDept: any = {
    id: 'fin',
    name: 'Financeiro',
    iconType: 'financeiro',
    agentCount: 4,
    efficiency: 98,
    status: 'ready'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentCardComponent);
    component = fixture.componentInstance;
    component.dept = mockDept;
    fixture.detectChanges();
  });

  it('deve renderizar o nome e a eficiência do departamento', () => {
    const title = fixture.debugElement.query(By.css('h3')).nativeElement.textContent;
    const efficiency = fixture.debugElement.query(By.css('.efficiency strong')).nativeElement.textContent;
    expect(title).toContain('Financeiro');
    expect(efficiency).toContain('98%');
  });

  it('clique no botão deve emitir evento selected com o departamento correto', () => {
    spyOn(component.selected, 'emit');
    const button = fixture.debugElement.query(By.css('.access-btn'));
    button.triggerEventHandler('click', null);
    expect(component.selected.emit).toHaveBeenCalledWith(mockDept);
  });
});
