import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightContent',
  standalone: true
})
export class HighlightContentPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | undefined): SafeHtml {
    if (!value) return '';
    let result = value;
    
    // Valores monetários → pill vermelho
    result = result.replace(
      /R\$\s?[\d.,]+[KMBi]?/g,
      '<span class="hl-money">$&</span>'
    );
    
    // Percentual positivo → verde
    result = result.replace(
      /\+\d+[,.]?\d*%/g,
      '<span class="hl-up">$&</span>'
    );
    
    // Percentual negativo → vermelho
    result = result.replace(
      /-\d+[,.]?\d*%/g,
      '<span class="hl-down">$&</span>'
    );
    
    // Negrito markdown **texto**
    result = result.replace(
      /\*\*(.+?)\*\*/g,
      '<span class="hl-bold">$1</span>'
    );
    
    // SEGURANÇA: content vem exclusivamente do backend FastAPI interno.
    // Nunca usar com conteúdo de entrada do usuário sem sanitização prévia.
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
