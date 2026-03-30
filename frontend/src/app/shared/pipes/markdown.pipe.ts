import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

declare var marked: any;

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    // Configura o marked para aceitar quebras de linha como <br> e tabelas GFM
    const html = marked.parse(value, {
      breaks: true,
      gfm: true
    });
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
