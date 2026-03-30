import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StepperComponent } from './stepper.component';
import { By } from '@angular/platform-browser';

describe('StepperComponent', () => {
  let component: StepperComponent;
  let fixture: ComponentFixture<StepperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
  });

  it('currentStep=3: pílulas 1 e 2 concluídas, pílula 3 ativa', () => {
    component.currentStep = 3;
    fixture.detectChanges();
    const steps = fixture.debugElement.queryAll(By.css('.step'));
    expect(steps[0].nativeElement.classList).toContain('done');
    expect(steps[1].nativeElement.classList).toContain('done');
    expect(steps[2].nativeElement.classList).toContain('active');
  });
});
