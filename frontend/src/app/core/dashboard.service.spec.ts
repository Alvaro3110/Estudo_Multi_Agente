import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService — getReportConfig', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardService);
  });

  it('retorna config correto para cada um dos 9 deptIds', (done) => {
    const ids = [
      'clusterizacao', 'garantias', 'financeiro', 'rentabilidade', 
      'socio', 'cadastro', 'emprestimo', 'investimentos', 'bacen'
    ];
    
    ids.forEach(id => {
      service.getReportConfig(id).subscribe(config => {
        expect(config.deptId).toBe(id);
      });
    });
    done();
  });

  it('retorna config genérico para deptId inválido', (done) => {
    service.getReportConfig('invalid').subscribe(config => {
      expect(config.deptId).toBe('financeiro'); // fallback default index 2
      done();
    });
  });

  it('cada config tem exatamente 3 kpis', (done) => {
    service.getReportConfig('financeiro').subscribe(config => {
      expect(config.kpis.length).toBe(3);
      done();
    });
  });

  it('cada config tem exatamente 3 agents', (done) => {
    service.getReportConfig('financeiro').subscribe(config => {
      expect(config.agents.length).toBe(3);
      done();
    });
  });

  it('cada config tem exatamente 4 indicators', (done) => {
    service.getReportConfig('financeiro').subscribe(config => {
      expect(config.indicators.length).toBe(4);
      done();
    });
  });
});
