import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatCell',
  standalone: true
})
export class FormatCellPipe implements PipeTransform {

  transform(value: unknown, colName: string): string {
    if (value === null || value === undefined) return '—';
    const col = colName.toLowerCase();

    // Moeda
    if (/value|amount|revenue|cost|price|receita|valor|freight/.test(col)) {
      const num = Number(value);
      if (!isNaN(num)) {
        return num.toLocaleString('pt-BR', {
          style: 'currency', currency: 'BRL'
        });
      }
    }
    
    // Data
    if (/date|data|created|updated/.test(col)) {
      const d = new Date(String(value));
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    }
    
    // Percentual
    if (/pct|percent|rate|taxa|eficiencia/.test(col)) {
      const num = Number(value);
      if (!isNaN(num)) return `${num.toFixed(1)}%`;
    }
    
    // Variação com seta
    if (/var|change|delta|variacao/.test(col)) {
      const num = Number(value);
      if (!isNaN(num)) {
        const arrow = num > 0 ? '↑' : num < 0 ? '↓' : '→';
        return `${arrow} ${Math.abs(num).toFixed(1)}%`;
      }
    }

    return String(value);
  }
}
