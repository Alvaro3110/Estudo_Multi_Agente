import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { HistoricoService } from '../../core/historico.service';
import { HistoricoItem, HistoricoMessage, UserGroup } from '../../core/models';
import { DateRelativePipe } from '../../shared/pipes/date-relative.pipe';
import { DeptIconComponent } from '../../shared/components/dept-icon/dept-icon.component';
import { UserGroupsService } from '../../core/user-groups.service';
import { AgentService, AgentStep } from '../../core/agent.service';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [CommonModule, FormsModule, DateRelativePipe, DeptIconComponent],
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.scss']
})
export class HistoricoComponent implements OnInit {
  private historicoService = inject(HistoricoService);
  private userGroupsService = inject(UserGroupsService);
  private agentService = inject(AgentService);
  private router = inject(Router);

  @ViewChild('msgArea') msgArea?: ElementRef;

  items$: Observable<HistoricoItem[]> = this.historicoService.getItems();
  filteredItems$: Observable<HistoricoItem[]> = this.items$;
  
  selectedItem: HistoricoItem | null = null;
  searchQuery = '';
  showContinueBanner = false;
  continuationMessages: HistoricoMessage[] = [];
  isTyping = false;
  inputText = '';
  activeGroup?: UserGroup;

  ngOnInit() {
    this.userGroupsService.getGroups().pipe(
      map(groups => groups.find(g => g.active))
    ).subscribe(group => this.activeGroup = group);
  }

  onSearchChange() {
    this.filteredItems$ = this.items$.pipe(
      map(items => items.filter(item => 
        item.query.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.departmentName.toLowerCase().includes(this.searchQuery.toLowerCase())
      ))
    );
  }

  selectItem(item: HistoricoItem): void {
    this.selectedItem = item;
    this.continuationMessages = [];
    this.inputText = '';
    this.showContinueBanner = item.canContinue;
    setTimeout(() => this.scrollToBottom(), 100);
  }

  goToChat(): void {
    this.router.navigate(['/chat']);
  }

  reexecutar(): void {
    this.router.navigate(['/chat'], {
      queryParams: {
        query: this.selectedItem?.query,
        dept: this.selectedItem?.departmentId,
        from: 'historico',
      }
    });
  }

  exportar(): void {
    alert('Exportação em desenvolvimento');
  }

  sendContinuation(): void {
    if (!this.inputText.trim() || this.isTyping) return;

    const userMsg: HistoricoMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: this.inputText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    this.continuationMessages.push(userMsg);
    const queryTerm = this.inputText;
    this.inputText = '';
    this.isTyping = true;
    this.scrollToBottom();

    this.agentService.runAgent({
      message: queryTerm,
      department_id: this.selectedItem!.departmentId,
      group_context: this.activeGroup?.name || '',
      context_from_history: this.selectedItem!.id,
    }).subscribe({
      next: (step) => this.handleStep(step),
      complete: () => { this.isTyping = false; this.scrollToBottom(); },
      error: () => { this.isTyping = false; },
    });
  }

  private handleStep(step: AgentStep): void {
    if (step.type === 'complete' && step.content) {
      this.continuationMessages.push({
        id: Date.now().toString(),
        role: 'agent',
        agentName: 'Agente Principal',
        agentColor: '#EC0000',
        agentIconType: 'cpu',
        content: step.content,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        status: 'done',
      });
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    if (this.msgArea?.nativeElement) {
      this.msgArea.nativeElement.scrollTop = this.msgArea.nativeElement.scrollHeight;
    }
  }
}
