import { MarkdownPipe } from './markdown.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('MarkdownPipe', () => {
  let pipe: MarkdownPipe;
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustHtml: (val: string) => val
          }
        }
      ]
    });
    sanitizer = TestBed.inject(DomSanitizer);
    pipe = new MarkdownPipe(sanitizer);
  });

  it('deve instanciar com sucesso', () => {
    expect(pipe).toBeTruthy();
  });

  it('deve retornar vazio se não houver conteúdo', () => {
    expect(pipe.transform('')).toBe('');
  });

  it('deve converter Markdown para HTML formatado', () => {
    const result = pipe.transform('## Título\nTest') as string;
    expect(result).toContain('<div class="md-h2">Título</div>');
    expect(result).toContain('<p>Test</p>');
  });

  it('deve formatar blocos de código customizados', () => {
    const result = pipe.transform('```sql\nSELECT * FROM tab;\n```') as string;
    expect(result).toContain('md-code-block');
    expect(result).toContain('<div class="md-code-lang">sql</div>');
    expect(result).toContain('SELECT * FROM tab;');
  });
});
