import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateRelative',
  standalone: true
})
export class DateRelativePipe implements PipeTransform {
  transform(value: string): string {
    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffH = diffMs / 3600000;
    const diffD = diffMs / 86400000;

    const time = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit'
    });

    if (diffH < 1) return `há ${Math.floor(diffMs / 60000)} min`;
    if (diffD < 1) return `hoje ${time}`;
    if (diffD < 2) return `ontem ${time}`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit'
    }) + ` ${time}`;
  }
}
