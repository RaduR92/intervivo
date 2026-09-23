import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { LayoutService } from '@core/services/layout.service';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Button],
  templateUrl: './sidebar.html',
  styles: ':host { display: contents; }',
})
export class Sidebar {
  protected readonly layout = inject(LayoutService);

  readonly navItems = input.required<NavItem[]>();
}
