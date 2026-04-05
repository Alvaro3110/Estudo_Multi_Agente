import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({ 
  name: 'markdown', 
  standalone: true 
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    // Configurar marked para output seguro
    const renderer = new marked.Renderer();

    // Customizar código inline
    renderer.codespan = (token: any) =>
      `<code class="md-code">${token.text}</code>`;

    // Customizar blocos de código (SQL, Python)
    renderer.code = (token: any) =>
      `<div class="md-code-block">
        <div class="md-code-lang">${token.lang || 'código'}</div>
        <pre><code>${token.text}</code></pre>
       </div>`;

    // H2 → seção do relatório
    renderer.heading = (token: any) =>
      `<div class="md-h${token.depth}">${token.text}</div>`;

    marked.setOptions({ renderer });
    const html = marked.parse(value) as string;

    // SEGURANÇA: content vem do backend FastAPI interno.
    // Nunca usar com input direto do usuário sem sanitização.
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
