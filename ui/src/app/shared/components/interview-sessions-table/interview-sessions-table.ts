import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TableModule } from '@openng/optimus-ui/table';
import { Button } from '@openng/optimus-ui/button';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import {
  InterviewSession,
  InterviewStatus,
  INTERVIEW_STATUS_LABELS,
  InterviewType,
  INTERVIEW_TYPE_LABELS,
} from '@core/services/interviews.service';

/**
 * Presentational sessions table, reused for the candidate's own upcoming
 * and history sections, and ready to drop into HR's candidate-detail page
 * once that's wired to the real API. `perspective` picks whether the
 * candidate or the interviewer column is shown — the other side of the
 * pairing is always redundant with whoever is already viewing the page.
 */
@Component({
  selector: 'app-interview-sessions-table',
  imports: [TableModule, PrimeTemplate, Button, DatePipe],
  templateUrl: './interview-sessions-table.html',
})
export class InterviewSessionsTable {
  protected readonly InterviewStatus = InterviewStatus;

  readonly sessions = input.required<InterviewSession[]>();
  readonly perspective = input<'candidate' | 'hr'>('candidate');
  readonly emptyMessage = input('No sessions yet.');
  readonly paginated = input(false);
  readonly rowClick = output<InterviewSession>();

  // PrimeNG's table body template hands back an untyped row, so bracket
  // indexing these label maps directly in the template trips strict
  // template checking — narrowing the cast in one place instead.
  protected statusLabel(status: InterviewStatus): string {
    return INTERVIEW_STATUS_LABELS[status];
  }

  protected typeLabel(type: InterviewType): string {
    return INTERVIEW_TYPE_LABELS[type];
  }
}
