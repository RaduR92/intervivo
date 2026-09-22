import { Component, inject } from '@angular/core';
import { Button } from '@openng/optimus-ui/button';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-header',
  imports: [Button],
  templateUrl: './header.html',
  styles: ':host { display: contents; }',
})
export class Header {
  protected readonly theme = inject(ThemeService);
}
