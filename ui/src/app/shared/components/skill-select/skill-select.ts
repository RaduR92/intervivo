import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MultiSelect } from '@openng/optimus-ui/multiselect';
import { SKILLS } from '@shared/constants/skills';

/**
 * Thin wrapper around Optimus's MultiSelect, pre-bound to the canonical
 * SKILLS list so callers don't each have to wire that up. Used by My
 * Profile's own-skills editor now; HR's candidate-add page can reuse it
 * once that page is wired to the real API.
 */
@Component({
  selector: 'app-skill-select',
  imports: [FormsModule, MultiSelect],
  templateUrl: './skill-select.html',
})
export class SkillSelect {
  protected readonly SKILLS: string[] = [...SKILLS];

  readonly value = input<string[]>([]);
  readonly valueChange = output<string[]>();
  readonly placeholder = input('Select skills');

  protected onModelChange(next: string[]): void {
    this.valueChange.emit(next);
  }
}
