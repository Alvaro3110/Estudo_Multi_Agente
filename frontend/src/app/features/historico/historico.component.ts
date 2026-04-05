import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HistoricoService } from '../../core/historico.service';
import { HistoricoItem } from '../../core/models';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateRelative',
  standalone: true
})
export class DateRelativePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (days === 0) return `hoje ${timeStr}`;
    if (days === 1) return `ontem ${timeStr}`;
    return `${date.toLocaleDateString([], { day: '2-digit', month: '2-digit' })} ${timeStr}`;
  }
}

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule, DateRelativePipe],
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss']
})
export class HistoricoComponent implements OnInit {
  private historicoService = inject(HistoricoService);
  private router = inject(Router);

  items: HistoricoItem[] = [];
  selectedItem?: HistoricoItem;
  searchTerm: string = '';

  ngOnInit() {
    this.historicoService.getHistorico().subscribe(data => {
      this.items = data;
    });
  }

  onSearch() {
    this.historicoService.search(this.searchTerm).subscribe(data => {
      this.items = data;
    });
  }

  selectItem(item: HistoricoItem) {
    this.selectedItem = item;
  }

  getBadgeClass(name: string): string {
    const map: any = {
      'Financeiro': 'badge-fin',
      'Logística': 'badge-log',
      'RH': 'badge-rh',
      'Tecnologia': 'badge-tec'
    };
    return map[name] || 'badge-def';
  }

  exportPdf() {
    alert("Funcionalidade em desenvolvimento");
  }

  reexecute(item: HistoricoItem) {
    this.router.navigate(['/chat'], { 
      queryParams: { 
        query: item.query, 
        dept: item.departmentId 
      } 
    });
  }
}
