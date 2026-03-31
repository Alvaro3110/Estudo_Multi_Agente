import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, AuthUser, LoginCredentials } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve realizar login bem-sucedido e salvar token no localStorage', () => {
    const mockCredentials: LoginCredentials = { matricula: '12345', senha: 'password123' };
    const mockUser: AuthUser = {
      id: '001',
      nome: 'Carlos Silva',
      matricula: '12345',
      perfil: 'Gestor',
      token: 'test-token',
      grupos: []
    };

    service.login(mockCredentials).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(localStorage.getItem('auth_token')).toBe('test-token');
      expect(JSON.parse(localStorage.getItem('auth_user')!)).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:8000/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockUser);
  });

  it('deve limpar localStorage e currentUser$ ao fazer logout', () => {
    localStorage.setItem('auth_token', 'token');
    localStorage.setItem('auth_user', JSON.stringify({ id: '1' }));
    
    service.logout();
    
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });

  it('isAuthenticated() deve retornar true quando há token no localStorage', () => {
    localStorage.setItem('auth_token', 'valid-token');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('restoreSession() deve restaurar o usuário do localStorage', (done) => {
    const mockUser: AuthUser = { id: '1', nome: 'Test', matricula: '1', perfil: 'G', token: 'T', grupos: [] };
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    localStorage.setItem('auth_token', 'T');

    service.restoreSession();

    service.getCurrentUser().subscribe(user => {
      expect(user).toEqual(mockUser);
      done();
    });
  });
});
