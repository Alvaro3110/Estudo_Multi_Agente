import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from '../../pipes/safe.pipe';

const ICONS: Record<string, string> = {
  'cluster':
    `<circle cx="12" cy="5" r="2"/>
     <circle cx="5" cy="19" r="2"/>
     <circle cx="19" cy="19" r="2"/>
     <line x1="12" y1="7" x2="5" y2="17"/>
     <line x1="12" y1="7" x2="19" y2="17"/>
     <line x1="5" y1="19" x2="19" y2="19"/>`,
  'shield':
    `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
  'dollar':
    `<line x1="12" y1="1" x2="12" y2="23"/>
     <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
  'trending':
    `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
     <polyline points="17 6 23 6 23 12"/>`,
  'user-check':
    `<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
     <circle cx="8.5" cy="7" r="4"/>
     <polyline points="17 11 19 13 23 9"/>`,
  'file-text':
    `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
     <polyline points="14 2 14 8 20 8"/>
     <line x1="16" y1="13" x2="8" y2="13"/>
     <line x1="16" y1="17" x2="8" y2="17"/>
     <polyline points="10 9 9 9 8 9"/>`,
  'credit-card':
    `<rect x="1" y="4" width="22" height="16" rx="2"/>
     <line x1="1" y1="10" x2="23" y2="10"/>`,
  'pie-chart':
    `<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
     <path d="M22 12A10 10 0 0 0 12 2v10z"/>`,
  'landmark':
    `<line x1="3" y1="22" x2="21" y2="22"/>
     <line x1="6" y1="18" x2="6" y2="11"/>
     <line x1="10" y1="18" x2="10" y2="11"/>
     <line x1="14" y1="18" x2="14" y2="11"/>
     <line x1="18" y1="18" x2="18" y2="11"/>
     <polygon points="12 2 20 7 4 7"/>`,
};

@Component({
  selector: 'app-dept-icon',
  standalone: true,
  imports: [CommonModule, SafePipe],
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="getIconSvg() | safe"></svg>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    svg { width: 100%; height: 100%; }
  `]
})
export class DeptIconComponent {
  @Input() type: string = '';

  getIconSvg(): string {
    return ICONS[this.type] || '';
  }
}
