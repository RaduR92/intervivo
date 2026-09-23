import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { InterviewSession } from '@core/services/interviews.service';

/**
 * Presentational sessions table, reused for the candidate's own upcoming
 * and history sections, and ready to drop into HR's candidate-detail page
 * once that's wired to the real API. `perspective` picks whether the
 * candidate or the interviewer column is shown — the other side of the
 * pairing is always redundant with whoever is already viewing the page.
 */
@Component({
  selector: 'app-interview-sessions-table',
  imports: [TableModule, PrimeTemplate, DatePipe],
  templateUrl: './interview-sessions-table.html',
})
export class InterviewSessionsTable {
  readonly sessions = input.required<InterviewSession[]>();
  readonly perspective = input<'candidate' | 'hr'>('candidate');
  readonly emptyMessage = input('No sessions yet.');
  readonly rowClick = output<InterviewSession>();
}
