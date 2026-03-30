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

  it('currentStep=1: só pílula 1 deve ter a classe active', () => {
    component.currentStep = 1;
    fixture.detectChanges();
    const steps = fixture.debugElement.queryAll(By.css('.step'));
    expect(steps[0].nativeElement.classList).toContain('active');
    expect(steps[1].nativeElement.classList).not.toContain('active');
    expect(steps[2].nativeElement.classList).not.toContain('active');
  });

  it('currentStep=2: pílula 1 tem classe done, pílula 2 ativa', () => {
    component.currentStep = 2;
    fixture.detectChanges();
    const steps = fixture.debugElement.queryAll(By.css('.step'));
    expect(steps[0].nativeElement.classList).toContain('done');
    expect(steps[1].nativeElement.classList).toContain('active');
  });

  it('currentStep=3: pílulas 1 e 2 devem ter a classe done, pílula 3 ativa', () => {
    component.currentStep = 3;
    fixture.detectChanges();
    const steps = fixture.debugElement.queryAll(By.css('.step'));
    expect(steps[0].nativeElement.classList).toContain('done');
    expect(steps[1].nativeElement.classList).toContain('done');
    expect(steps[2].nativeElement.classList).toContain('active');
  });
});
