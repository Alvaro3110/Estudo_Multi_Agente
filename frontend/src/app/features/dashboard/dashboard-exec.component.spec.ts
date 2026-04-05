import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DashboardExecComponent } from './dashboard-exec.component';
import { DashboardExecService } from '../../core/dashboard-exec.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardExecComponent', () => {
  let component: DashboardExecComponent;
  let fixture: ComponentFixture<DashboardExecComponent>;
  let dashboardService: jasmine.SpyObj<DashboardExecService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DashboardExecService', ['getExecKpis', 'getDeptKpis', 'getAlerts', 'getAgentStatuses']);
    spy.getExecKpis.and.returnValue(of([{ label: 'Test', value: '100%', trend: 'up', trendType: 'up', accent: true }]));
    spy.getDeptKpis.and.returnValue(of([]));
    spy.getAlerts.and.returnValue(of([]));
    spy.getAgentStatuses.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DashboardExecComponent],
      providers: [
        { provide: DashboardExecService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardExecComponent);
    component = fixture.componentInstance;
    dashboardService = TestBed.inject(DashboardExecService) as jasmine.SpyObj<DashboardExecService>;
    fixture.detectChanges();
  });

  it('deve renderizar KPI cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.kpi-card');
    expect(cards.length).toBe(1);
    expect(cards[0].classList.contains('accent')).toBeTrue();
  });

  it('deve chamar loadData no ngOnInit', () => {
    expect(dashboardService.getExecKpis).toHaveBeenCalled();
  });

  it('deve atualizar dados a cada 30s', fakeAsync(() => {
    spyOn(component, 'loadData');
    component.ngOnInit();
    tick(30000);
    expect(component.loadData).toHaveBeenCalledTimes(2); // Uma no init, outra no tick
    component.ngOnDestroy();
  }));
});
