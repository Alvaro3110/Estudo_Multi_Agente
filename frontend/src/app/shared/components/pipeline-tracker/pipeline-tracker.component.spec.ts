import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PipelineTrackerComponent, PipelineState } from './pipeline-tracker.component';

describe('PipelineTrackerComponent', () => {
  let component: PipelineTrackerComponent;
  let fixture: ComponentFixture<PipelineTrackerComponent>;

  const mockState: PipelineState = {
    steps_done: ['transformer', 'planner'],
    step_active: 'data_scanner',
    steps_pending: ['categorical_semantic', 'router', 'agentes', 'consolidador'],
    current_label: 'Buscando metadados no Databricks...',
    is_replanning: false,
    replan_count: 0,
    total_steps: 7
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelineTrackerComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(PipelineTrackerComponent);
    component = fixture.componentInstance;
    component.state = mockState;
    fixture.detectChanges();
  });

  it('deve ser criado com sucesso', () => {
    expect(component).toBeTruthy();
  });

  it('deve agrupar os steps de exibição corretamente', () => {
    const steps = component.getDisplaySteps();
    expect(steps.length).toBe(component.VISIBLE_NODES.length);
    expect(steps[0].isDone).toBeTrue(); // transformer
    expect(steps[2].isActive).toBeTrue(); // data_scanner
    expect(steps[3].isDone).toBeFalse(); // categorical_semantic
  });

  it('deve exibir modo de replanejamento', () => {
    component.state = { ...mockState, is_replanning: true, replan_count: 1 };
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.pt-replan')).toBeTruthy();
  });
});
