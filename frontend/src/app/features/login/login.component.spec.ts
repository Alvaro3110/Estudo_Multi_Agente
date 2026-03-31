import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
        LoginComponent
      ],
      providers: [
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('formulário deve ser inválido quando vazio', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('botão deve estar desabilitado quando formulário é inválido', () => {
    const btn = fixture.nativeElement.querySelector('.primary-btn');
    expect(btn.disabled).toBeTrue();
  });

  it('onSubmit deve chamar authService.login quando formulário é válido', () => {
    component.loginForm.setValue({ matricula: '12345', senha: 'password' });
    authService.login.and.returnValue(of({} as any));
    
    component.onSubmit();
    
    expect(authService.login).toHaveBeenCalledWith({ matricula: '12345', senha: 'password' });
  });

  it('deve exibir mensagem de erro quando login falha', () => {
    component.loginForm.setValue({ matricula: '12345', senha: 'password' });
    authService.login.and.returnValue(throwError(() => new Error('Falha no login')));
    
    component.onSubmit();
    fixture.detectChanges();
    
    const errorMsg = fixture.nativeElement.querySelector('.form-error');
    expect(errorMsg.textContent).toContain('Falha no login');
  });

  it('togglePassword deve alternar visibilidade da senha', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePassword();
    expect(component.showPassword).toBeTrue();
  });
});
