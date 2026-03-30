import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'sqlHighlight',
  standalone: true
})
export class SqlHighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string | undefined): SafeHtml {
    if (!value) return '';
    let result = value;

    // Palavras-chave SQL → cor #1565C0 font-weight 500
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'INNER JOIN', 'ON',
      'GROUP BY', 'ORDER BY', 'LIMIT', 'AND', 'OR', 'WITH', 'AS', 'HAVING',
      'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'DISTINCT'
    ];
    
    // Create a regex for all keywords, matching whole words only, case insensitive
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
    
    result = result.replace(keywordRegex, (match) => {
      // Re-capitalize as uppercase
      return `<strong style="color: #1565C0; font-weight: 500;">${match.toUpperCase()}</strong>`;
    });

    // Nomes de tabelas Databricks (após FROM/JOIN) → cor #7B1FA2
    // Padrão: catalog.schema.table
    const tableRegex = /\b(\w+\.\w+\.\w+)\b/g;
    result = result.replace(tableRegex, (match) => {
      return `<span style="color: #7B1FA2;">${match}</span>`;
    });

    // SEGURANÇA: query vem do backend interno
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
