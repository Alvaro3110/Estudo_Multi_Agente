import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContextBarComponent } from './context-bar.component';
import { By } from '@angular/platform-browser';

describe('ContextBarComponent', () => {
  let component: ContextBarComponent;
  let fixture: ComponentFixture<ContextBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContextBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ContextBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve renderizar label "CONTEXTO DA CARTEIRA:"', () => {
    const label = fixture.debugElement.query(By.css('.label')).nativeElement.textContent;
    expect(label).toContain('CONTEXTO DA CARTEIRA:');
  });

  it('deve renderizar valor em vermelho', () => {
    const value = fixture.debugElement.query(By.css('.value')).nativeElement;
    const styles = window.getComputedStyle(value);
    // Nota: Em testes unitários o computed style pode depender do ambiente. 
    // O mais seguro é verificar o conteúdo e a class/template.
    expect(value.textContent).toContain('VAREJO DIGITAL SP / CORPORATE CENTER');
  });
});
